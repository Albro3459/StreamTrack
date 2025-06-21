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
public class GenreController : ControllerBase {

    private readonly StreamTrackDbContext context;
    private readonly IMapper mapper;

    public GenreController(StreamTrackDbContext _context, IMapper _mapper) {
        context = _context;
        mapper = _mapper;
    }

    // GET: API/Genre/Get
    [HttpGet("Get")]
    public async Task<ActionResult<List<GenreDTO>>> GetGenreProfileOptions() {
        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        List<GenreDTO> genres = await context.Genre.Select(g => mapper.Map<Genre, GenreDTO>(g)).ToListAsync();

        return genres != null ? genres : NoContent();
    }
}