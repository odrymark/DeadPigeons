using DataAccess;
using Microsoft.EntityFrameworkCore.Storage;
using Xunit;

namespace Test.ServiceTests;

public abstract class TestBase : IAsyncLifetime
{
    protected readonly PigeonsDbContext Db;
    private IDbContextTransaction _transaction;

    protected TestBase(PigeonsDbContext db)
    {
        Db = db;
        Db.Database.EnsureCreated();
    }

    public async ValueTask InitializeAsync()
    {
        _transaction = await Db.Database.BeginTransactionAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await _transaction.RollbackAsync();
        await _transaction.DisposeAsync();
    }

    protected async Task<User> CreateUserAsync(string username = "testuser", string password = "password", bool isAdmin = false)
    {
        var user = new User
        {
            id = Guid.NewGuid(),
            username = username,
            password = password,
            email = $"{username}@example.com",
            phoneNumber = "1234567890",
            isAdmin = isAdmin,
            isActive = true,
            createdAt = DateTime.UtcNow,
            lastLogin = DateTime.UtcNow
        };

        await Db.Users.AddAsync(user);
        await Db.SaveChangesAsync();
        return user;
    }

    protected async Task<Game> CreateGameAsync(bool isOpen = true)
    {
        var game = new Game
        {
            id = Guid.NewGuid(),
            createdAt = DateTime.UtcNow,
            openUntil = isOpen ? DateTime.UtcNow.AddHours(1) : DateTime.UtcNow.AddHours(-1),
            income = 0
        };

        await Db.Games.AddAsync(game);
        await Db.SaveChangesAsync();
        return game;
    }

    protected async Task<Board> CreateBoardAsync(Guid userId, Guid gameId, int repeats = 0, List<int>? numbers = null)
    {
        var board = new Board
        {
            id = Guid.NewGuid(),
            userId = userId,
            gameId = gameId,
            numbers = numbers ?? new List<int> { 1, 2, 3 },
            createdAt = DateTime.UtcNow,
            isWinner = null,
            repeats = repeats
        };

        await Db.Boards.AddAsync(board);
        await Db.SaveChangesAsync();
        return board;
    }

    protected async Task<Payment> CreatePaymentAsync(Guid userId, int? amount = 100, bool? isApproved = true)
    {
        var payment = new Payment
        {
            id = Guid.NewGuid(),
            userId = userId,
            amount = amount,
            paymentNumber = "PAY123",
            createdAt = DateTime.UtcNow,
            isApproved = isApproved
        };

        await Db.Payments.AddAsync(payment);
        await Db.SaveChangesAsync();
        return payment;
    }
}