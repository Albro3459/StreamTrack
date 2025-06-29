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
    private readonly RapidAPIService rapidAPIService;
    private readonly IMapper mapper;

    public ContentController(StreamTrackDbContext _context, Service _service, RapidAPIService _rapidAPIService, IMapper _mapper) {
        context = _context;
        service = _service;
        rapidAPIService = _rapidAPIService;
        mapper = _mapper;
    }

    // // GET: API/Content/GetDetails/{tmdbID}
    // [HttpGet("GetDetails/{*tmdbID}")]
    // public async Task<ActionResult<ContentDTO>> GetContentDetailsByID(string tmdbID) {
    //     // Get the user's auth token to get the firebase uuid to get the correct user's data
    //     // User's can only get their own data

    //     string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

    //     if (string.IsNullOrEmpty(uid))
    //         return Unauthorized();

    //     tmdbID = Uri.UnescapeDataString(tmdbID);

    //     ContentDetail? content = await context.ContentDetail
    //             .Include(c => c.Genres)
    //             .Include(c => c.StreamingOptions)
    //                 .ThenInclude(s => s.StreamingService)
    //             .FirstOrDefaultAsync(c => c.TMDB_ID == tmdbID);
    //     if (content == null) {
    //         return NotFound();
    //     }

    //     return mapper.Map<ContentDetail, ContentDTO>(content);
    // }

    // POST: API/Content/Details
    [HttpPost("Details")]
    public async Task<ActionResult<ContentDTO>> FetchContentDetails([FromBody] ContentPartialDTO partialDTO) {
        // Get the user's auth token to get the firebase uuid to get the correct user's data
        // User's can only get their own data

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        ContentPartial? partial = await context.ContentPartial
                                                    .Include(c => c.Detail)
                                                        .ThenInclude(c => c.Genres)
                                                    .Include(c => c.Detail)
                                                        .ThenInclude(c => c.StreamingOptions)
                                                            .ThenInclude(s => s.StreamingService)
                                                    .FirstOrDefaultAsync(c => c.TMDB_ID == partialDTO.TMDB_ID);

        bool newPartial = false;
        if (partial == null) {
            partial = mapper.Map<ContentPartialDTO, ContentPartial>(partialDTO);
            context.ContentPartial.Add(partial);
            newPartial = true;
        }
        try {
            if (partial.Detail == null) {
                ContentDetail? detail = await rapidAPIService.FetchContentDetailsByTMDBIDAsync(partialDTO);
                if (detail != null) {
                    partial.Detail = detail;
                    context.ContentDetail.Add(detail);
                }
                // Always save the partial
                await context.SaveChangesAsync();
            }
            else if (newPartial) {
                await context.SaveChangesAsync();
            }
        }
        catch (Exception ex) {
            System.Console.WriteLine("Error in GetContentDetails (probably on save): " + ex);
            return BadRequest();
        }

        if (partial.Detail == null) {
            return NotFound();
        }

        return mapper.Map<ContentDetail, ContentDTO>(partial.Detail);
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


    // TODO: Need to remove old popular && not in any lists, at the end IFF no errors
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
                                .Include(c => c.Partial).ThenInclude(p => p.Lists)
                                .Where(c => c.IsPopular && !tmdbIds.Contains(c.TMDB_ID) &&
                                            c.Partial != null && c.Partial.Lists.Count == 0
                                ).ToListAsync();

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
            context.ContentDetail.AddRange(contents);
        }

        if (previouslyPopular.Count > 0) {
            context.ContentDetail.RemoveRange(previouslyPopular);
        }

        try {
            await context.SaveChangesAsync();
        }
        catch (Exception ex) {
            System.Console.WriteLine("Error saving in BulkPopularUpdate: " + ex);
            return BadRequest();
        }

        return Ok();
    }
}