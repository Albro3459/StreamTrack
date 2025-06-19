using Microsoft.EntityFrameworkCore;
using System.Text.Json;

using API.Models;
using Microsoft.EntityFrameworkCore.ChangeTracking;

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

        var stringListComparer = new ValueComparer<List<string>>(
            (c1, c2) => c1.SequenceEqual(c2),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToList()
        );

        modelBuilder.Entity<Content>()
            .Property(e => e.Cast)
            .HasConversion(
                x => JsonSerializer.Serialize(x, null as JsonSerializerOptions),
                x => JsonSerializer.Deserialize<List<string>>(x, null as JsonSerializerOptions) ?? new()
            ).Metadata.SetValueComparer(stringListComparer);

        modelBuilder.Entity<Content>()
            .Property(e => e.Directors)
            .HasConversion(
                x => JsonSerializer.Serialize(x, null as JsonSerializerOptions),
                x => JsonSerializer.Deserialize<List<string>>(x, null as JsonSerializerOptions) ?? new()
            ).Metadata.SetValueComparer(stringListComparer);

        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<List>().HasQueryFilter(l => !l.IsDeleted);
        modelBuilder.Entity<ListShares>().HasQueryFilter(l => !l.IsDeleted);
        modelBuilder.Entity<Content>().HasQueryFilter(c => !c.IsDeleted);
        modelBuilder.Entity<Genre>().HasQueryFilter(g => !g.IsDeleted);
        modelBuilder.Entity<StreamingService>().HasQueryFilter(s => !s.IsDeleted);
        modelBuilder.Entity<StreamingOption>().HasQueryFilter(s => !s.IsDeleted);

        // ... seed data

        modelBuilder.Entity<User>().HasData(new User {
            UserID = "JMPOe14DyzcyxyVNBjqVjhssB5y2",
            Email = "brodsky.alex22@gmail.com",
            FirstName = "Alex",
            LastName = "Brodsky",
            IsDeleted = false
        });

        modelBuilder.Entity<Genre>().HasData(
            new Genre { GenreID = "1", Name = "Comedy", IsDeleted = false },
            new Genre { GenreID = "2", Name = "Drama", IsDeleted = false }
        );

        modelBuilder.Entity<User>()
            .HasMany(u => u.Genres)
            .WithMany(g => g.Users)
            .UsingEntity<Dictionary<string, object>>(
                "UserGenre",
                j => j.HasData(
                    new { UsersUserID = "JMPOe14DyzcyxyVNBjqVjhssB5y2", GenresGenreID = "1" },
                    new { UsersUserID = "JMPOe14DyzcyxyVNBjqVjhssB5y2", GenresGenreID = "2" }
                )
            );
    }
}