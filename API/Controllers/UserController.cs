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
public class UserController : ControllerBase {

    private readonly StreamTrackDbContext context;
    private readonly IMapper mapper;

    public UserController(StreamTrackDbContext _context, IMapper _mapper) {
        context = _context;
        mapper = _mapper;
    }

    // GET: api/User/Get
    [HttpGet("Get")]
    public async Task<ActionResult<UserDataDTO>> GetUserData() {
        // Get the user's auth token to get the firebase uuid to get the correct user's data
        // User's can only get their own data

        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(uid))
            return Unauthorized();

        var userDataDTO = await context.User
            .Include(u => u.Genres)
            .Where(u => u.UserID == uid)
            .Select(u => mapper.Map<User, UserDataDTO>(u))
            .FirstOrDefaultAsync();

        return userDataDTO != null ? userDataDTO : NotFound();
    }
}