using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AutoMapper;

using API.DTOs;
using API.Infrastructure;
using API.Models;

namespace API.Controllers;

[Route("API/[controller]")]
[ApiController]
public class StreamingController : ControllerBase {

    private readonly StreamTrackDbContext context;
    private readonly IMapper mapper;

    public StreamingController(StreamTrackDbContext _context, IMapper _mapper) {
        context = _context;
        mapper = _mapper;
    }

    // GET: API/Streaming/GetAll
    [HttpGet("GetAll")]
    public async Task<ActionResult<List<StreamingServiceDTO>>> GetAllStreamingProfileOptions() {
        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        List<StreamingServiceDTO> services = await context.StreamingService.Select(s => mapper.Map<StreamingService, StreamingServiceDTO>(s)).OrderBy(s => s.Name).ToListAsync();

        return services != null ? services : NoContent();
    }

    // GET: API/Streaming/GetMain
    [HttpGet("GetMain")]
    public async Task<ActionResult<List<StreamingServiceDTO>>> GetMainStreamingProfileOptions() {
        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        // See db context for the main ones
        List<string> mainIDs = new List<string> { "1", "2", "3", "4", "5", "6", "7", "8" };

        List<StreamingServiceDTO> services = await context.StreamingService.Where(s => mainIDs.Contains(s.ServiceID)).Select(s => mapper.Map<StreamingService, StreamingServiceDTO>(s)).ToListAsync();

        return services != null ? services : NoContent();
    }
}