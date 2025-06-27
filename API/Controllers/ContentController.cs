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
public class ContentController : ControllerBase {

    private readonly StreamTrackDbContext context;
    private readonly Service service;
    private readonly IMapper mapper;

    public ContentController(StreamTrackDbContext _context, Service _service, IMapper _mapper) {
        context = _context;
        service = _service;
        mapper = _mapper;
    }

    // GET: API/Content/Get/{tmdbID}
    [HttpGet("Get/{*tmdbID}")]
    public async Task<ActionResult<ContentDTO>> GetContentByID(string tmdbID) {
        // Get the user's auth token to get the firebase uuid to get the correct user's data
        // User's can only get their own data

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        tmdbID = Uri.UnescapeDataString(tmdbID);

        Content? content = await context.Content
                .Include(c => c.Genres)
                .Include(c => c.StreamingOptions)
                    .ThenInclude(s => s.StreamingService)
                .FirstOrDefaultAsync(c => c.TMDB_ID == tmdbID);
        if (content == null) return NotFound();

        return mapper.Map<Content, ContentDTO>(content);
    }

    // GET: API/Content/GetAll
    [HttpGet("GetAll")]
    public async Task<ActionResult<List<ContentDTO>>> GetAllContent() {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        List<Content> contents = await context.Content
                .Include(c => c.Genres)
                .Include(c => c.StreamingOptions)
                    .ThenInclude(s => s.StreamingService)
                .ToListAsync();

        return mapper.Map<List<Content>, List<ContentDTO>>(contents);
    }

    // POST: API/Content/BulkUpdate
    [HttpPost("BulkUpdate")]
    public async Task<ActionResult<ContentDTO>> BulkUpdate(List<ContentDTO> dtos) {
        // Only the lambda user will be sending the content

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid) || uid != LAMBDA.UID) {
            return Unauthorized();
        }

        List<Content> contents = new();
        foreach (var dto in dtos) {
            Content? content = await context.Content.FirstOrDefaultAsync(c => c.TMDB_ID == dto.TMDB_ID);
            if (content == null) {
                content = await service.ContentDTOToContent(dto);
                if (content != null) {
                    contents.Add(content);
                }
            }
        }

        if (contents.Count == 0) return Ok();

        await context.Content.AddRangeAsync(contents);

        await context.SaveChangesAsync();

        return Ok();
    }
}