using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AutoMapper;

using API.DTOs;
using API.Infrastructure;
using API.Models;
using API.Services;

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
    public async Task<ActionResult<List<ListDTO>>> GetUserLists() {
        // Get the user's auth token to get the firebase uuid to get the correct user's data
        // User's can only get their own data

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        List<List> lists = await context.List
                    .Include(l => l.Owner)
                    .Include(l => l.Contents)
                        .ThenInclude(c => c.Genres)
                    .Include(l => l.Contents)
                        .ThenInclude(c => c.StreamingOptions)
                            .ThenInclude(s => s.StreamingService)
                    .Include(l => l.ListShares)
                    .Where(l => l.OwnerUserID == uid)
                    .ToListAsync();

        List<ListDTO> dtos = lists.Select(l => {
            var dto = mapper.Map<List, ListDTO>(l);
            dto.IsOwner = l.OwnerUserID == uid;
            return dto;
        }).ToList();

        return dtos;
    }

    // POST: API/List/{listName}/Create
    [HttpPost("{listName}/Create")]
    public async Task<ActionResult> CreateUserList(string listName) {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        User? owner = await context.User.Where(u => u.UserID == uid).FirstOrDefaultAsync();
        if (owner == null) {
            return Unauthorized();
        }

        List? list = await context.List.Where(l => l.OwnerUserID == uid && l.ListName.ToLower().Trim().Equals(listName.ToLower().Trim())).FirstOrDefaultAsync();
        if (list != null) return Conflict();

        await context.List.AddAsync(new List(owner, listName));

        await context.SaveChangesAsync();

        return Ok();
    }

    // POST: API/List/{listName}/Add
    [HttpPost("{listName}/Add")]
    public async Task<ActionResult<ListDTO>> AddToUserList(string listName, [FromBody] ContentDTO contentDTO) {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        List? list = await context.List
                    .Include(l => l.Owner)
                    .Include(l => l.Contents)
                        .ThenInclude(c => c.Genres)
                    .Include(l => l.Contents)
                        .ThenInclude(c => c.StreamingOptions)
                            .ThenInclude(s => s.StreamingService)
                    .Include(l => l.ListShares)
                    .Where(l => l.OwnerUserID == uid && l.ListName.ToLower().Trim().Equals(listName.ToLower().Trim())).FirstOrDefaultAsync();
        if (list == null) return NotFound();

        Content? content = await context.Content.Where(c => c.ContentID == contentDTO.ContentID).FirstOrDefaultAsync();
        if (content == null) {
            content = await service.ContentDTOToContent(contentDTO);
            if (content == null) {
                return BadRequest();
            }
        }

        if (!list.Contents.Any(c => c.ContentID == content.ContentID)) {
            list.Contents.Add(content);
        }

        await context.SaveChangesAsync();

        ListDTO dto = mapper.Map<List, ListDTO>(list);
        if (list.OwnerUserID == uid) {
            dto.IsOwner = true;
        }

        return dto;
    }

    // DELETE: API/List/{listName}/Remove/{contentID}
    [HttpDelete("{listName}/Remove/{contentID}")]
    public async Task<ActionResult<ListDTO>> RemoveFromUserList(string listName, string contentID) {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        List? list = await context.List
                    .Include(l => l.Owner)
                    .Include(l => l.Contents)
                        .ThenInclude(c => c.Genres)
                    .Include(l => l.Contents)
                        .ThenInclude(c => c.StreamingOptions)
                            .ThenInclude(s => s.StreamingService)
                    .Include(l => l.ListShares)
                    .Where(l => l.OwnerUserID == uid && l.ListName.ToLower().Trim().Equals(listName.ToLower().Trim())).FirstOrDefaultAsync();
        if (list == null) return NotFound();

        Content? content = await context.Content.Where(c => c.ContentID == contentID).FirstOrDefaultAsync();
        if (content == null) {
            return BadRequest();
        }

        if (list.Contents.Any(c => c.ContentID == content.ContentID)) {
            list.Contents.Remove(content);
        }

        await context.SaveChangesAsync();

        ListDTO dto = mapper.Map<List, ListDTO>(list);
        if (list.OwnerUserID == uid) {
            dto.IsOwner = true;
        }

        return dto;
    }
}