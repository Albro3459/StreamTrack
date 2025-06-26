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
public class UserController : ControllerBase {

    private readonly StreamTrackDbContext context;
    private readonly Service service;
    private readonly IMapper mapper;

    public UserController(StreamTrackDbContext _context, Service _service, IMapper _mapper) {
        context = _context;
        service = _service;
        mapper = _mapper;
    }

    // GET: API/User/Check
    [HttpGet("Check")]
    public async Task<ActionResult> CheckIfUserExists() {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        User? user = await context.User.FirstOrDefaultAsync(u => u.UserID == uid);

        return user != null ? Ok() : NotFound();
    }

    // GET: API/User/Get
    [HttpGet("Get")]
    public async Task<ActionResult<UserDataDTO>> GetUserData() {
        // Get the user's auth token to get the firebase uuid to get the correct user's data
        // User's can only get their own data

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        User? user = await service.GetFullUserByID(uid);
        if (user == null) {
            return NotFound();
        }

        return await service.MapUserToUserDTO(user);
    }

    // POST: API/User/Create
    [HttpPost("Create")]
    public async Task<ActionResult> CreateNewUser() {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        string? email = User.FindFirstValue(ClaimTypes.Email);

        if (string.IsNullOrEmpty(uid) || string.IsNullOrEmpty(email))
            return Unauthorized();

        // Delete incorrect users (different email or uid)
        User? uidUser = await context.User.FirstOrDefaultAsync(u => u.UserID == uid && u.Email != email);
        if (uidUser != null) {
            context.User.Remove(uidUser);
        }

        User? emailUser = await context.User.FirstOrDefaultAsync(u => u.Email == email && u.UserID != uid);
        if (emailUser != null) {
            context.User.Remove(emailUser);
        }

        // Check if user exists
        var user = await context.User
                        .Include(u => u.ListsOwned)
                        .FirstOrDefaultAsync(u => u.UserID == uid && u.Email == email);

        // Otherwise create a new user
        if (user == null) {
            user = new User(uid, email);
            context.User.Add(user);
            user.ListsOwned.Add(new List(user, "Favorites")); // Add default list
        }

        await context.SaveChangesAsync();

        return Ok();
    }

    // Patch: API/User/Update
    [HttpPatch("Update")]
    public async Task<ActionResult<UserDataDTO>> UpdateUser([FromBody] UserUpdateProfileDataDTO data) {

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid)) {
            return Unauthorized();
        }

        User? user = await service.GetFullUserByID(uid);
        if (user == null) {
            return NotFound();
        }

        if (data.FirstName != null) user.FirstName = data.FirstName;
        if (data.LastName != null) user.LastName = data.LastName;
        if (data.Genres != null) {
            user.Genres.Clear();
            List<string> genreNames = data.Genres.Select(g => g.ToLower().Trim()).ToList();
            List<Genre> genres = context.Genre.Where(g => genreNames.Contains(g.Name.ToLower().Trim())).ToList();
            foreach (var genre in genres) {
                user.Genres.Add(genre);
            }
        }
        if (data.StreamingServices != null) {
            user.StreamingServices.Clear();
            List<string> serviceNames = data.StreamingServices.Select(s => s.ToLower().Trim()).ToList();
            List<StreamingService> services = context.StreamingService.Where(s => serviceNames.Contains(s.Name.ToLower().Trim())).ToList();
            foreach (var service in services) {
                user.StreamingServices.Add(service);
            }
        }

        await context.SaveChangesAsync();

        return await service.MapUserToUserDTO(user);
    }
}