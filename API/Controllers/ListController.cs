using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AutoMapper;

using API.DTOs;
using API.Infrastructure;
using API.Models;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
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

        List<ListDTO> lists = await context.List
                    .Where(l => l.OwnerUserID == uid)
                    .Select(l => mapper.Map<List, ListDTO>(l))
                    .ToListAsync();

        return lists;
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

    // PATCH: API/List/{listName}/Add
    [HttpPatch("{listName}/Add")]
    public async Task<ActionResult> AddToUserList(string listName, [FromBody] ContentDTO contentDTO) {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        List? list = await context.List.Where(l => l.OwnerUserID == uid && l.ListName.ToLower().Trim().Equals(listName.ToLower().Trim())).FirstOrDefaultAsync();
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

        return Ok();
    }
}