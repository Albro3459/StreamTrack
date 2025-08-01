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
    public DbSet<ContentPartial> ContentPartial { get; set; }
    public DbSet<ContentDetail> ContentDetail { get; set; }
    public DbSet<Genre> Genre { get; set; }
    public DbSet<StreamingOption> StreamingOption { get; set; }
    public DbSet<StreamingService> StreamingService { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        // ... define relationships

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
                .IsUnique();

        modelBuilder.Entity<User>()
            .HasMany(u => u.ListsOwned)
            .WithOne(l => l.Owner)
                .HasForeignKey(l => l.OwnerUserID);

        modelBuilder.Entity<User>()
            .HasMany(u => u.ListShares)
            .WithOne(ls => ls.User)
                .HasForeignKey(ls => ls.UserID);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Genres)
            .WithMany(g => g.Users)
            .UsingEntity(j => j.ToTable("UserGenre"));

        modelBuilder.Entity<User>()
            .HasMany(u => u.StreamingServices)
            .WithMany(s => s.Users)
            .UsingEntity(j => j.ToTable("UserService"));

        modelBuilder.Entity<ContentPartial>()
            .HasOne(p => p.Detail)
            .WithOne(d => d.Partial)
            .HasForeignKey<ContentDetail>(d => d.TMDB_ID)
            .OnDelete(DeleteBehavior.Cascade); // Deleting Partial deletes Detail

        modelBuilder.Entity<ContentDetail>()
            .HasMany(c => c.Genres)
            .WithMany(g => g.ContentDetails)
            .UsingEntity(j => j.ToTable("ContentGenre"));

        modelBuilder.Entity<List>()
            .HasMany(l => l.ListShares)
            .WithOne(ls => ls.List)
                .HasForeignKey(ls => ls.ListID);

        modelBuilder.Entity<List>()
            .HasMany(l => l.ContentPartials)
            .WithMany(c => c.Lists)
            .UsingEntity(j => j.ToTable("ListContent"));

        modelBuilder.Entity<StreamingOption>()
            .HasKey(so => new { so.TMDB_ID, so.ServiceID });

        modelBuilder.Entity<ListShares>()
            .HasKey(ls => new { ls.ListID, ls.UserID });

        // Used to compare two lists of strings
        var stringListComparer = new ValueComparer<List<string>>(
            (c1, c2) =>
                    (c1 == null && c2 == null) ? true :
                    (c1 == null || c2 == null) ? false :
                    c1.SequenceEqual(c2),
            c => c == null ? 0 : c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c == null ? new List<string>() : c.ToList()
        );

        modelBuilder.Entity<ContentDetail>()
            .Property(e => e.Cast)
            .HasConversion(
                x => JsonSerializer.Serialize(x, null as JsonSerializerOptions),
                x => JsonSerializer.Deserialize<List<string>>(x, null as JsonSerializerOptions) ?? new()
            ).Metadata.SetValueComparer(stringListComparer); // It needs to know how to compare the string arrays

        modelBuilder.Entity<ContentDetail>()
            .Property(e => e.Directors)
            .HasConversion(
                x => JsonSerializer.Serialize(x, null as JsonSerializerOptions),
                x => JsonSerializer.Deserialize<List<string>>(x, null as JsonSerializerOptions) ?? new()
            ).Metadata.SetValueComparer(stringListComparer); // It needs to know how to compare the string arrays


        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<List>().HasQueryFilter(l => !l.IsDeleted);
        modelBuilder.Entity<ContentPartial>().HasQueryFilter(c => !c.IsDeleted);
        modelBuilder.Entity<ContentDetail>().HasQueryFilter(c => !c.IsDeleted);
        modelBuilder.Entity<Genre>().HasQueryFilter(g => !g.IsDeleted);
        modelBuilder.Entity<StreamingService>().HasQueryFilter(s => !s.IsDeleted);

        modelBuilder.Entity<ListShares>()
            .HasQueryFilter(ls => !ls.List.IsDeleted && !ls.User.IsDeleted);
        modelBuilder.Entity<StreamingOption>()
            .HasQueryFilter(so => !so.ContentDetails.IsDeleted);

        // ... seed data

        modelBuilder.Entity<Genre>().HasData(
            new Genre { GenreID = "1", Name = "Action", IsDeleted = false },
            new Genre { GenreID = "2", Name = "Comedy", IsDeleted = false },
            new Genre { GenreID = "3", Name = "Documentary", IsDeleted = false },
            new Genre { GenreID = "4", Name = "Drama", IsDeleted = false },
            new Genre { GenreID = "5", Name = "Horror", IsDeleted = false },
            new Genre { GenreID = "6", Name = "Romance", IsDeleted = false },
            new Genre { GenreID = "7", Name = "Science Fiction", IsDeleted = false },
            new Genre { GenreID = "8", Name = "Thriller", IsDeleted = false },
            new Genre { GenreID = "9", Name = "Western", IsDeleted = false }
        );

        modelBuilder.Entity<StreamingService>().HasData(
            new StreamingService { ServiceID = "1", Name = "Netflix", DarkLogo = "https://media.movieofthenight.com/services/netflix/logo-dark-theme.svg", LightLogo = "https://media.movieofthenight.com/services/netflix/logo-light-theme.svg" },
            new StreamingService { ServiceID = "2", Name = "Hulu", DarkLogo = "https://media.movieofthenight.com/services/hulu/logo-dark-theme.svg", LightLogo = "https://media.movieofthenight.com/services/hulu/logo-light-theme.svg" },
            new StreamingService { ServiceID = "3", Name = "Max", DarkLogo = "https://media.movieofthenight.com/services/max/logo-dark-theme.svg", LightLogo = "https://media.movieofthenight.com/services/max/logo-light-theme.svg" },
            new StreamingService { ServiceID = "4", Name = "Prime Video", DarkLogo = "https://media.movieofthenight.com/services/prime/logo-dark-theme.svg", LightLogo = "https://media.movieofthenight.com/services/prime/logo-light-theme.svg" },
            new StreamingService { ServiceID = "5", Name = "Disney+", DarkLogo = "https://media.movieofthenight.com/services/disney/logo-dark-theme.svg", LightLogo = "https://media.movieofthenight.com/services/disney/logo-light-theme.svg" },
            new StreamingService { ServiceID = "6", Name = "Apple TV", DarkLogo = "https://media.movieofthenight.com/services/apple/logo-dark-theme.svg", LightLogo = "https://media.movieofthenight.com/services/apple/logo-light-theme.svg" },
            new StreamingService { ServiceID = "7", Name = "Paramount+", DarkLogo = "https://media.movieofthenight.com/services/paramount/logo-dark-theme.svg", LightLogo = "https://media.movieofthenight.com/services/paramount/logo-light-theme.svg" },
            new StreamingService { ServiceID = "8", Name = "Peacock", DarkLogo = "https://media.movieofthenight.com/services/peacock/logo-dark-theme.svg", LightLogo = "https://media.movieofthenight.com/services/peacock/logo-light-theme.svg" }

        );
    }
}