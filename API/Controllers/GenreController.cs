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

    // GET: API/Genre/GetAll
    [HttpGet("GetAll")]
    public async Task<ActionResult<List<GenreDTO>>> GetAllGenreProfileOptions() {
        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        var user = await context.User.FirstOrDefaultAsync(u => u.UserID == uid);
        if (user == null) return Unauthorized();

        List<GenreDTO> genres = await context.Genre.Select(g => mapper.Map<Genre, GenreDTO>(g)).OrderBy(g => g.Name).ToListAsync();

        return genres != null ? genres : NoContent();
    }

    // GET: API/Genre/GetMain
    [HttpGet("GetMain")]
    public async Task<ActionResult<List<GenreDTO>>> GetMainGenreProfileOptions() {
        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        var user = await context.User.FirstOrDefaultAsync(u => u.UserID == uid);
        if (user == null) return Unauthorized();

        // See db context for the main ones
        List<string> mainIDs = new List<string> { "1", "2", "3", "4", "5", "6", "7", "8", "9" };

        List<GenreDTO> genres = await context.Genre.Where(g => mainIDs.Contains(g.GenreID)).Select(g => mapper.Map<Genre, GenreDTO>(g)).ToListAsync();

        return genres != null ? genres : NoContent();
    }
}