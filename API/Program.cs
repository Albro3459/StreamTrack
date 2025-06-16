using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer; // Going to need to use firebase tokens
// using AutoMapper;

using API.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<StreamTrackDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Development"))
);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Auth
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        var firebase = builder.Configuration.GetSection("Firebase");
        options.Authority = firebase["Issuer"];
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters {
            ValidateIssuer = true,
            ValidIssuer = firebase["Issuer"],
            ValidateAudience = true,
            ValidAudience = firebase["Audience"],
            ValidateLifetime = true
        };
    });

// Require authentication globally for all controllers
builder.Services.AddAuthorization(options => {
    options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});


builder.Services.AddAutoMapper(typeof(Program));
// builder.Services.AddAutoMapper(typeof(MappingProfile)); // Make custom profile

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ORDER MATTERS

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();