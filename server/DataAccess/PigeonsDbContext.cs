using Microsoft.EntityFrameworkCore;

namespace DataAccess;

public class PigeonsDbContext : DbContext
{
    public PigeonsDbContext(DbContextOptions<PigeonsDbContext> options)
        : base(options)
    {
        
    }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Payment>()
            .HasOne(p => p.user)
            .WithMany(u => u.payments)
            .HasForeignKey(p => p.userId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Board>()
            .HasOne(b => b.user)
            .WithMany(u => u.boards)
            .HasForeignKey(b => b.userId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Game>()
            .HasMany(w => w.winners)
            .WithMany(u => u.winningGames)
            .UsingEntity<Dictionary<string, object>>(
                "UserWeekWinners"
            );
    }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Board> Boards { get; set; }
}