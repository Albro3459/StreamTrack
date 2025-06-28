using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AutoMapper;

using API.DTOs;
using API.Infrastructure;
using API.Models;
using API.Services;
using System.Net.NetworkInformation;

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
    public async Task<ActionResult<UserMinimalDataDTO>> GetUserData() {
        // Used on app load to get their profile data and the lists with content IDs

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        // User? user = await service.GetFullUserByID(uid);
        User? user = await context.User
                .Include(u => u.ListsOwned)
                    .ThenInclude(l => l.ContentPartials)
                .Include(u => u.ListShares)
                    .ThenInclude(ls => ls.List)
                        .ThenInclude(l => l.ContentPartials)
                .Include(u => u.Genres)
                .Include(u => u.StreamingServices)
                .FirstOrDefaultAsync(u => u.UserID.Equals(uid));

        if (user == null) {
            return NotFound();
        }

        return await service.MapUserToMinimalDTO(user);
    }

    // GET: API/User/GetContents
    [HttpGet("GetContents")]
    public async Task<ActionResult<List<ContentPartialDTO>>> GetUserContents() {
        // Used to get all the contents in any of the User's lists.
        // Client will use the lists and content IDs from GetUserData() to know what's in each list

        string? uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        // User? user = await service.GetFullUserByID(uid); // I dont need the streaming options for contents
        User? user = await context.User
                .Include(u => u.ListsOwned)
                    .ThenInclude(l => l.ContentPartials)
                .Include(u => u.ListShares)
                    .ThenInclude(ls => ls.List)
                        .ThenInclude(l => l.ContentPartials)
                .FirstOrDefaultAsync(u => u.UserID.Equals(uid));

        if (user == null) {
            return NotFound();
        }

        List<ContentPartialDTO> contents = service.GetUsersContentMinimalDTOs(user);

        return contents;
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
    public async Task<ActionResult<UserMinimalDataDTO>> UpdateUser([FromBody] UserUpdateProfileDataDTO data) {

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

        return await service.MapUserToMinimalDTO(user);
    }
}