using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AutoMapper;

using API.DTOs;
using API.Infrastructure;
using API.Models;
using API.Services;
using System.Runtime.ExceptionServices;

namespace API.Controllers;

[Route("API/[controller]")]
[ApiController]
public class ListController : ControllerBase {

    private readonly StreamTrackDbContext context;
    private readonly Service service;
    private readonly Services.APIService rapidAPIService;
    private readonly BackgroundTaskQueue taskQueue;
    private readonly IServiceProvider serviceProvider;
    private readonly IMapper mapper;
    private const int MAX_USER_LIST_COUNT = 10;

    public ListController(StreamTrackDbContext _context, Service _service, Services.APIService _rapidAPIService, BackgroundTaskQueue _taskQueue, IServiceProvider _serviceProvider, IMapper _mapper) {
        context = _context;
        service = _service;
        rapidAPIService = _rapidAPIService;
        taskQueue = _taskQueue;
        mapper = _mapper;
        serviceProvider = _serviceProvider;
    }

    // Only used for testing with Swagger
    // GET: API/List/Get
    [HttpGet("Get")]
    public async Task<ActionResult<ListsAllDTO>> GetUserLists() {
        // Get the user's auth token to get the firebase uuid to get the correct user's data
        // User's can only get their own data

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        User? user = await service.GetFullUserByID(uid);
        if (user == null) {
            return NotFound();
        }

        UserDataDTO userDTO = await service.MapUserToFullUserDTO(user);

        ListsAllDTO allLists = new ListsAllDTO {
            ListsOwned = userDTO.ListsOwned,
            ListsSharedWithMe = userDTO.ListsSharedWithMe,
            ListsSharedWithOthers = userDTO.ListsSharedWithOthers,
        };

        return allLists;
    }

    // POST: API/List/{listName}/Create
    [HttpPost("{listName}/Create")]
    public async Task<ActionResult<ListMinimalDTO>> CreateUserList(string listName) {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        User? owner = await context.User
                        .Include(u => u.ListsOwned)
                        .Where(u => u.UserID == uid).FirstOrDefaultAsync();
        if (owner == null) {
            return Unauthorized();
        }
        if (owner.ListsOwned.Count >= MAX_USER_LIST_COUNT) {
            return BadRequest();
        }

        listName = Uri.UnescapeDataString(listName);

        List? list = await context.List.Where(l => l.OwnerUserID == uid && l.ListName.ToLower().Trim().Equals(listName.ToLower().Trim())).FirstOrDefaultAsync();
        if (list != null) return Conflict();

        list = new List(owner, listName);

        await context.List.AddAsync(list);

        await context.SaveChangesAsync();

        var dto = mapper.Map<List, ListMinimalDTO>(list);
        dto.IsOwner = true;

        return dto;
    }

    // DELETE: API/List/{listName}/Remove
    [HttpDelete("{listName}/Remove/")]
    public async Task<ActionResult<ListMinimalDTO>> RemoveUserList(string listName) {
        // Right now only works for user owned lists
        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        listName = Uri.UnescapeDataString(listName).ToLower();

        var user = await context.User
                            .Include(u => u.ListsOwned)
                            .FirstOrDefaultAsync(u => u.UserID == uid);
        if (user == null)
            return NotFound();

        var list = user.ListsOwned.FirstOrDefault(l => l.ListName.ToLower() == listName);
        if (list == null)
            return NotFound();

        context.List.Remove(list);

        await context.SaveChangesAsync();

        return Ok();
    }

    // POST: API/List/{listName}/Add
    [HttpPost("{listName}/Add")]
    public async Task<ActionResult<ListMinimalDTO>> AddToUserList(string listName, [FromBody] ContentPartialDTO contentDTO) {
        // Right now only works for user owned lists
        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        listName = Uri.UnescapeDataString(listName);

        List<List> lists = await service.GetFullListsOwnedByUserID(uid);

        List? list = lists.Where(l => l.ListName.ToLower().Trim().Equals(listName.ToLower().Trim())).FirstOrDefault();
        if (list == null) return NotFound();

        ContentPartial? partial = await context.ContentPartial
                                        .Include(c => c.Detail)
                                        .FirstOrDefaultAsync(c => c.TMDB_ID == contentDTO.TMDB_ID);

        if (partial == null) {
            partial = new ContentPartial {
                TMDB_ID = contentDTO.TMDB_ID,
                Title = contentDTO.Title,
                Overview = contentDTO.Overview,
                Rating = contentDTO.Rating,
                ReleaseYear = contentDTO.ReleaseYear,
                VerticalPoster = contentDTO.VerticalPoster ?? "",
                HorizontalPoster = contentDTO.HorizontalPoster ?? ""
            };
            context.ContentPartial.Add(partial);
        }

        if (!list.ContentPartials.Any(c => c.TMDB_ID == contentDTO.TMDB_ID)) {
            list.ContentPartials.Add(partial);
        }

        await context.SaveChangesAsync();

        // send off background Task to fetch and save full content details
        taskQueue.QueueBackgroundWorkItem(async (serviceProvider, token) => {
            var rapidAPIService = serviceProvider.GetRequiredService<Services.APIService>();
            await rapidAPIService.FetchAndSaveMissingContent(contentDTO);
        });


        var dto = mapper.Map<List, ListMinimalDTO>(list);
        if (list.OwnerUserID == uid) {
            dto.IsOwner = true;
        }

        return dto;
    }

    // DELETE: API/List/{listName}/Remove/{tmdbID}
    [HttpDelete("{listName}/Remove/{tmdbID}")]
    public async Task<ActionResult<ListMinimalDTO>> RemoveFromUserList(string listName, string tmdbID) {
        // Right now only works for user owned lists
        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        listName = Uri.UnescapeDataString(listName);
        tmdbID = Uri.UnescapeDataString(tmdbID);

        List<List> lists = await service.GetFullListsOwnedByUserID(uid);

        List? list = lists.Where(l => l.ListName.ToLower().Trim().Equals(listName.ToLower().Trim())).FirstOrDefault();
        if (list == null) return NotFound();

        ContentPartial? partial = await context.ContentPartial
                                        .Include(c => c.Detail)
                                        .FirstOrDefaultAsync(c => c.TMDB_ID == tmdbID);
        if (partial == null) {
            return BadRequest();
        }

        // Delete the partial
        list.ContentPartials.Remove(partial); // Will NOT error

        // If the detail exists and NOT popular and is NOT in any other lists, then remove from the DB.
        if (partial.Detail is ContentDetail detail && !detail.IsPopular && !await context.List
                                                                            .Where(l => l.ListID != list.ListID)
                                                                            .AnyAsync(l => l.ContentPartials.Any(p => p.Detail != null && p.Detail.TMDB_ID == detail.TMDB_ID))
        ) {
            context.ContentPartial.Remove(partial); // Deletes the detail too due to cascade delete
        }

        await context.SaveChangesAsync();

        var dto = mapper.Map<List, ListMinimalDTO>(list);
        if (list.OwnerUserID == uid) {
            dto.IsOwner = true;
        }

        return dto;
    }
}