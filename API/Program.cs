using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer; // Going to need to use firebase tokens
using Microsoft.OpenApi.Models;
// using AutoMapper;

using API.Infrastructure;
using API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<StreamTrackDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Development"))
);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(options => {
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "StreamTrack", Version = "v1" });

    // Add JWT bearer security definition
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    // Apply Bearer Auth globally
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

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


builder.Services.AddAutoMapper(typeof(Program)); // All profiles in this project

// Services
builder.Services.AddScoped<Service>();
builder.Services.AddScoped<PopularSortingService>();
builder.Services.AddHttpClient<APIService>();
builder.Services.AddSingleton<BackgroundTaskQueue>();
builder.Services.AddHostedService<QueuedHostedService>();

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