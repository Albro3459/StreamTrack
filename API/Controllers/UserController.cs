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
            .Include(u => u.OwnedLists)
            .Include(u => u.ListShares)
            .Include(u => u.Genres)
            .Include(u => u.StreamingServices)
            .Where(u => u.UserID == uid)
            .Select(u => mapper.Map<User, UserDataDTO>(u))
            .FirstOrDefaultAsync();

        return userDataDTO != null ? userDataDTO : NotFound();
    }

    // POST: API/User/Create
    [HttpPost("Create")]
    public async Task<ActionResult> CreateNewUser() {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        string? email = User.FindFirstValue(ClaimTypes.Email);

        if (string.IsNullOrEmpty(uid) || string.IsNullOrEmpty(email))
            return Unauthorized();

        User newUser = new User(uid, email);

        await context.User.AddAsync(newUser);

        await context.SaveChangesAsync();

        return Ok();
    }

    // Patch: API/User/Update
    [HttpPatch("Update")]
    public async Task<ActionResult> UpdateUser([FromBody] UserUpdateProfileDataDTO data) {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid)) {
            return Unauthorized();
        }

        User? user = await context.User.FirstOrDefaultAsync(u => u.UserID.Equals(uid));

        if (user == null) {
            return NotFound();
        }

        if (data.FirstName != null) user.FirstName = data.FirstName;
        if (data.LastName != null) user.LastName = data.LastName;
        if (data.Genres != null) {
            List<string> genreNames = data.Genres.Select(g => g.ToLower().Trim()).ToList();
            List<Genre> genres = context.Genre.Where(g => genreNames.Contains(g.Name.ToLower().Trim())).ToList();
            user.Genres = genres;
        }
        if (data.StreamingServices != null) {
            List<string> serviceNames = data.StreamingServices.Select(s => s.ToLower().Trim()).ToList();
            List<StreamingService> services = context.StreamingService.Where(s => serviceNames.Contains(s.Name.ToLower().Trim())).ToList();
            user.StreamingServices = services;
        }

        await context.SaveChangesAsync();

        return Ok();
    }
}