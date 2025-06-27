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
    private readonly IMapper mapper;

    public ListController(StreamTrackDbContext _context, Service _service, IMapper _mapper) {
        context = _context;
        service = _service;
        mapper = _mapper;
    }

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

        User? owner = await context.User.Where(u => u.UserID == uid).FirstOrDefaultAsync();
        if (owner == null) {
            return Unauthorized();
        }

        List? list = await context.List.Where(l => l.OwnerUserID == uid && l.ListName.ToLower().Trim().Equals(listName.ToLower().Trim())).FirstOrDefaultAsync();
        if (list != null) return Conflict();

        list = new List(owner, listName);

        await context.List.AddAsync(list);

        await context.SaveChangesAsync();

        var dto = mapper.Map<List, ListMinimalDTO>(list);
        dto.IsOwner = true;

        return dto;
    }

    // // POST: API/List/Update
    // [HttpPost("Update")]
    // public async Task<ActionResult<UserDataDTO>> UpdateListsWithContent(ListsUpdateDTO dto) {
    //     // Not really tested tbh

    //     string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

    //     if (string.IsNullOrEmpty(uid))
    //         return Unauthorized();

    //     // Find the content
    //     Content? content = await context.Content.FirstOrDefaultAsync(c => c.TMDB_ID.Equals(dto.TMDB_ID));
    //     if (content == null) return BadRequest();

    //     // Get all the lists
    //     List<string> allListNames = dto.AddToLists.Concat(dto.RemoveFromLists).Distinct().ToList();
    //     List<List> userLists = await context.List
    //                                 .Include(l => l.Contents)
    //                                 .Where(l => l.OwnerUserID == uid && allListNames.Contains(l.ListName))
    //                                 .ToListAsync();
    //     List<List> listsToAddTo = userLists.Where(l => dto.AddToLists.Contains(l.ListName)).ToList();
    //     List<List> listsToRemoveFrom = userLists.Where(l => dto.RemoveFromLists.Contains(l.ListName)).ToList();

    //     // For each List to Add to, add if not there
    //     foreach (List list in listsToAddTo) {
    //         if (!list.Contents.Any(c => c.TMDB_ID.Equals(dto.TMDB_ID))) {
    //             list.Contents.Add(content);
    //         }
    //     }

    //     // For each list to remove from, remove it
    //     foreach (List list in listsToRemoveFrom) {
    //         if (list.Contents.Any(c => c.TMDB_ID.Equals(dto.TMDB_ID))) {
    //             list.Contents.Remove(content);
    //         }
    //     }

    //     // Save changes async
    //     await context.SaveChangesAsync();

    //     // Fetch the user's data

    //     User? user = await service.GetFullUserByID(uid);
    //     if (user == null) {
    //         return NotFound();
    //     }

    //     UserDataDTO userDTO = await service.MapUserToFullUserDTO(user);

    //     return userDTO;
    // }

    // POST: API/List/{listName}/Add
    [HttpPost("{listName}/Add")]
    public async Task<ActionResult<ListMinimalDTO>> AddToUserList(string listName, [FromBody] ContentDTO contentDTO) {
        // Right now only works for user owned lists
        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        List<List> lists = await service.GetFullListsOwnedByUserID(uid);

        List? list = lists.Where(l => l.ListName.ToLower().Trim().Equals(listName.ToLower().Trim())).FirstOrDefault();
        if (list == null) return NotFound();

        Content? content = await context.Content.Where(c => c.TMDB_ID == contentDTO.TMDB_ID).FirstOrDefaultAsync();
        if (content == null) {
            content = await service.ContentDTOToContent(contentDTO);
            if (content == null) {
                return BadRequest();
            }
        }

        if (!list.Contents.Any(c => c.TMDB_ID == content.TMDB_ID)) {
            list.Contents.Add(content);
        }

        await context.SaveChangesAsync();

        var dto = mapper.Map<List, ListMinimalDTO>(list);
        if (list.OwnerUserID == uid) {
            dto.IsOwner = true;
        }

        return dto;
    }

    // DELETE: API/List/{listName}/Remove/{tmdbID}
    [HttpDelete("{listName}/Remove/{*tmdbID}")]
    public async Task<ActionResult<ListMinimalDTO>> RemoveFromUserList(string listName, string tmdbID) {
        // Right now only works for user owned lists
        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        tmdbID = Uri.UnescapeDataString(tmdbID);

        List<List> lists = await service.GetFullListsOwnedByUserID(uid);

        List? list = lists.Where(l => l.ListName.ToLower().Trim().Equals(listName.ToLower().Trim())).FirstOrDefault();
        if (list == null) return NotFound();

        Content? content = await context.Content.Where(c => c.TMDB_ID == tmdbID).FirstOrDefaultAsync();
        if (content == null) {
            return BadRequest();
        }

        if (list.Contents.Any(c => c.TMDB_ID == content.TMDB_ID)) {
            list.Contents.Remove(content);
        }

        await context.SaveChangesAsync();

        var dto = mapper.Map<List, ListMinimalDTO>(list);
        if (list.OwnerUserID == uid) {
            dto.IsOwner = true;
        }

        return dto;
    }
}