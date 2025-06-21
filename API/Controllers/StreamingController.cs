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

    // GET: API/Streaming/Get
    [HttpGet("Get")]
    public async Task<ActionResult<List<StreamingServiceDTO>>> GetStreamingProfileOptions() {
        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        List<StreamingServiceDTO> services = await context.StreamingService.Select(s => mapper.Map<StreamingService, StreamingServiceDTO>(s)).ToListAsync();

        return services != null ? services : NoContent();
    }
}