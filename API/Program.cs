using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer; // Going to need to use firebase tokens
// using AutoMapper;

using API.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<StreamTrackDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Development")));

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// builder.Services.AddAuthentication(
//     JwtBearerDefaults.AuthenticationScheme
// ).AddBearerToken();

// var mapperConfig = new MapperConfiguration(mc => {
//     mc.AddProfile(new Map());
// });
// IMapper mapper = mapperConfig.CreateMapper();
// builder.Services.AddSingleton(mapper);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// app.UseAuthorization();

// app.MapControllers();

app.Run();