using Microsoft.EntityFrameworkCore;
using System.Text.Json;

using API.Models;

namespace API.Infrastructure;

public class StreamTrackDbContext : DbContext {

    public StreamTrackDbContext(DbContextOptions<StreamTrackDbContext> options) : base(options) { }

    public DbSet<User> User { get; set; }
    public DbSet<List> List { get; set; }
    public DbSet<ListShares> ListShares { get; set; }
    public DbSet<Content> Content { get; set; }
    public DbSet<Genre> Genre { get; set; }
    public DbSet<StreamingOption> StreamingOption { get; set; }
    public DbSet<StreamingService> StreamingService { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        // ... define relationships

        modelBuilder.Entity<User>()
            .HasMany(u => u.StreamingServices)
            .WithMany(s => s.Users)
            .UsingEntity(j => j.ToTable("UserService"));

        modelBuilder.Entity<User>()
            .HasMany(u => u.Genres)
            .WithMany(g => g.Users)
            .UsingEntity(j => j.ToTable("UserGenre"));

        modelBuilder.Entity<Content>()
            .HasMany(c => c.Lists)
            .WithMany(l => l.Contents)
            .UsingEntity(j => j.ToTable("ListContent"));

        modelBuilder.Entity<Content>()
            .HasMany(c => c.Genres)
            .WithMany(g => g.Contents)
            .UsingEntity(j => j.ToTable("ContentGenre"));

        modelBuilder.Entity<StreamingOption>()
            .HasKey(so => new { so.ContentID, so.ServiceID });

        modelBuilder.Entity<ListShares>()
            .HasKey(ls => new { ls.ListID, ls.UserID });

        modelBuilder.Entity<Content>()
            .Property(e => e.Cast)
            .HasConversion(
                x => JsonSerializer.Serialize(x, null as JsonSerializerOptions),
                x => JsonSerializer.Deserialize<List<string>>(x, null as JsonSerializerOptions) ?? new()
            );

        modelBuilder.Entity<Content>()
            .Property(e => e.Directors)
            .HasConversion(
                x => JsonSerializer.Serialize(x, null as JsonSerializerOptions),
                x => JsonSerializer.Deserialize<List<string>>(x, null as JsonSerializerOptions) ?? new()
            );

        // ... seed data

    }
}