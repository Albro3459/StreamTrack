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

    // GET: API/Content/GetDetails/{tmdbID}
    [HttpGet("GetDetails/{*tmdbID}")]
    public async Task<ActionResult<ContentDTO>> GetContentDetailsByID(string tmdbID) {
        // Get the user's auth token to get the firebase uuid to get the correct user's data
        // User's can only get their own data

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        tmdbID = Uri.UnescapeDataString(tmdbID);

        ContentDetail? content = await context.ContentDetail
                .Include(c => c.Genres)
                .Include(c => c.StreamingOptions)
                    .ThenInclude(s => s.StreamingService)
                .FirstOrDefaultAsync(c => c.TMDB_ID == tmdbID);
        if (content == null) return NotFound();

        return mapper.Map<ContentDetail, ContentDTO>(content);
    }

    // GET: API/Content/GetAll
    [HttpGet("GetAll")]
    public async Task<ActionResult<List<ContentPartialDTO>>> GetAllContent() {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        List<ContentPartial> contents = await context.ContentPartial
                                    .ToListAsync();

        return mapper.Map<List<ContentPartial>, List<ContentPartialDTO>>(contents);
    }

    // POST: API/Content/BulkPopularUpdate
    [HttpPost("BulkPopularUpdate")]
    public async Task<ActionResult<ContentDTO>> BulkPopularUpdate(List<ContentDTO> dtos) {
        // Only the lambda user will be sending the content

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid) || uid != LAMBDA.UID) {
            return Unauthorized();
        }

        var tmdbIds = dtos.Select(d => d.TMDB_ID).ToList();

        // Find popular and NOT in a list (to delete :) )
        List<ContentDetail> previouslyPopular = await context.ContentDetail
                                .Include(c => c.Partial).ThenInclude(p => p.Lists).ThenInclude(l => l.ContentPartials).ThenInclude(p => p.Detail)
                                .Where(c => c.IsPopular && !tmdbIds.Contains(c.TMDB_ID)).ToListAsync();

        var existingContents = await context.ContentDetail.Where(c => tmdbIds.Contains(c.TMDB_ID)).ToListAsync();

        List<ContentDetail> contents = new();
        foreach (var dto in dtos) {
            ContentDetail? content = await context.ContentDetail.FirstOrDefaultAsync(c => c.TMDB_ID == dto.TMDB_ID);
            if (content == null) {
                content = await service.ContentDTOToContent(dto);
                if (content != null) {
                    content.IsPopular = true; // POPULAR
                    contents.Add(content);
                }
            }
            else {
                content.IsPopular = true; // POPULAR
            }
        }

        if (contents.Count > 0) {
            await context.ContentDetail.AddRangeAsync(contents);
        }

        await context.SaveChangesAsync();

        return Ok();
    }
}