using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AutoMapper;

using API.DTOs;
using API.Infrastructure;
using API.Models;
using System.Net.WebSockets;

namespace API.Controllers;

[Route("API/[controller]")]
[ApiController]
public class UserController : ControllerBase {

    private readonly StreamTrackDbContext context;
    private readonly IMapper mapper;

    public UserController(StreamTrackDbContext _context, IMapper _mapper) {
        context = _context;
        mapper = _mapper;
    }

    // GET: API/User/Get
    [HttpGet("Get")]
    public async Task<ActionResult<UserDataDTO>> GetUserData() {
        // Get the user's auth token to get the firebase uuid to get the correct user's data
        // User's can only get their own data

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        var userDataDTO = await context.User
            .Include(u => u.Genres)
            .Where(u => u.UserID == uid)
            .Select(u => mapper.Map<User, UserDataDTO>(u))
            .FirstOrDefaultAsync();

        return userDataDTO != null ? userDataDTO : NotFound();
    }

    // POST: API/User/Create
    [HttpPost("Create")]
    public async Task<ActionResult> CreateNewUser() {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        User newUser = new User(uid);

        await context.User.AddAsync(newUser);

        await context.SaveChangesAsync();

        return Ok();
    }

    // Patch: API/User/Update
    [HttpPatch("Update")]
    public async Task<ActionResult> UpdateUser([FromBody] UserDataDTO data) {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid)) {
            return Unauthorized();
        }

        User? user = await context.User.FirstOrDefaultAsync(u => u.UserID.Equals(uid));

        if (user == null) {
            return NotFound();
        }

        if (data.Email != null) user.Email = data.Email;
        if (data.FirstName != null) user.FirstName = data.FirstName;
        if (data.LastName != null) user.LastName = data.LastName;
        if (data.Genres != null) {
            List<string> genreNames = data.Genres.Select(g => g.Name.ToLower().Trim()).ToList();
            List<Genre> genres = context.Genre.Where(g => genreNames.Contains(g.Name.ToLower().Trim())).ToList();
            user.Genres = genres;
        }

        await context.SaveChangesAsync();

        return Ok();
    }
}