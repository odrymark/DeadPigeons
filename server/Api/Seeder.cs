using Api.Services.Password;
using DataAccess;

namespace api;

public class Seeder(PigeonsDbContext ctx) : ISeeder
{
    public async Task Seed()
    {
        ctx.Database.EnsureCreated();

        SeedAdminUser();
        SeedBaseGame();
        
        await ctx.SaveChangesAsync();
    }

    private void SeedAdminUser()
    {
        if (!ctx.Users.Any(u => u.username == "admin"))
        {
            var passwd = new PasswordService().HashPassword("password123");

            var admin = new User
            {
                id = Guid.NewGuid(),
                username = "admin",
                password = passwd,
                email = "admin@gmail.com",
                phoneNumber = "+4512345678",
                isAdmin = true,
                isActive = true,
                createdAt = DateTime.UtcNow,
                lastLogin = DateTime.UtcNow
            };

            ctx.Users.Add(admin);
        }
    }

    private void SeedBaseGame()
    {
        if (!ctx.Games.Any())
        {
            var danishTz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Copenhagen");
            var localTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, danishTz);

            int daysUntilSaturday = ((int)DayOfWeek.Saturday - (int)localTime.DayOfWeek + 7) % 7;

            var nextSaturdayLocal = localTime.Date.AddDays(daysUntilSaturday)
                .AddHours(17); // 17:00 local time

            var openUntilUtc = TimeZoneInfo.ConvertTimeToUtc(nextSaturdayLocal, danishTz);

            var game = new Game
            {
                id = Guid.NewGuid(),
                numbers = new List<int>(),
                income = 0,
                createdAt = DateTime.UtcNow,
                openUntil = openUntilUtc
            };

            ctx.Games.Add(game);
        }
    }
}

public interface ISeeder
{
    Task Seed();
}