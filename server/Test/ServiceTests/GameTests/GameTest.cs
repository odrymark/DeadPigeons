using Api.DTOs;
using Api.DTOs.Response;
using Api.Services.Games;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Xunit;

public class GameTest
{
    private readonly PigeonsDbContext _db;
    private readonly GameService _service;

    public GameTest(PigeonsDbContext db)
    {
        _db = db;
        _db.Database.EnsureCreated();

        _service = new GameService(_db);
    }

    // -------------------------
    // GetActiveGame
    // -------------------------
    [Fact]
    public async Task GetActiveGame_Returns_Game_When_Exists()
    {
        var game = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int>(),
            openUntil = DateTime.UtcNow.AddHours(1)
        };
        await _db.Games.AddAsync(game);
        await _db.SaveChangesAsync();

        var result = await _service.GetActiveGame();

        Assert.NotNull(result);
        Assert.Empty(result!.numbers);
    }

    [Fact]
    public async Task GetActiveGame_Returns_Null_When_None()
    {
        var result = await _service.GetActiveGame();
        Assert.Null(result);
    }

    // -------------------------
    // GetCurrGameClosing
    // -------------------------
    [Fact]
    public async Task GetCurrGameClosing_Returns_CloseDate_When_ActiveGameExists()
    {
        var game = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int>(),
            openUntil = DateTime.UtcNow.AddHours(2)
        };
        await _db.Games.AddAsync(game);
        await _db.SaveChangesAsync();

        var result = await _service.GetCurrGameClosing();

        Assert.Equal(game.openUntil, result.closeDate);
    }

    [Fact]
    public async Task GetCurrGameClosing_Throws_When_NoActiveGame()
    {
        await Assert.ThrowsAsync<Exception>(() => _service.GetCurrGameClosing());
    }

    // -------------------------
    // GetLastGame
    // -------------------------
    [Fact]
    public async Task GetLastGame_Returns_Last_CompletedGame()
    {
        // First game
        var oldGame = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int> {1,2,3},
            createdAt = DateTime.UtcNow.AddDays(-2)
        };
        await _db.Games.AddAsync(oldGame);

        // Second game (last)
        var lastGame = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int> {4,5,6},
            createdAt = DateTime.UtcNow.AddDays(-1)
        };
        await _db.Games.AddAsync(lastGame);

        await _db.SaveChangesAsync();

        var result = await _service.GetLastGame();
        Assert.Equal(lastGame.id, result.id);
    }

    [Fact]
    public async Task GetLastGame_Throws_When_NoPreviousGame()
    {
        // Only active game exists
        var activeGame = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int>()
        };
        await _db.Games.AddAsync(activeGame);
        await _db.SaveChangesAsync();

        await Assert.ThrowsAsync<Exception>(() => _service.GetLastGame());
    }

    // -------------------------
    // GetLastGameNums
    // -------------------------
    [Fact]
    public async Task GetLastGameNums_Returns_Numbers()
    {
        var oldGame = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int> {7,8,9},
            createdAt = DateTime.UtcNow.AddDays(-2)
        };
        var lastGame = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int> {1,2,3},
            createdAt = DateTime.UtcNow.AddDays(-1)
        };
        await _db.Games.AddRangeAsync(oldGame, lastGame);
        await _db.SaveChangesAsync();

        var result = await _service.GetLastGameNums();

        Assert.Equal(new List<int> {1,2,3}, result);
    }

    // -------------------------
    // CreateNextGame
    // -------------------------
    [Fact]
    public void CreateNextGame_Adds_Game_To_Context()
    {
        var openUntil = DateTime.UtcNow.AddHours(3);

        var game = _service.CreateNextGame(openUntil);

        Assert.Equal(openUntil, game.openUntil);
        Assert.Empty(game.numbers);
        Assert.Equal(0, game.income);
        Assert.Contains(game, _db.Games.Local);
    }

    // -------------------------
    // GetAllGames
    // -------------------------
    [Fact]
    public async Task GetAllGames_Returns_CompletedGames()
    {
        var g1 = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int> {1,2,3},
            createdAt = DateTime.UtcNow.AddDays(-2)
        };
        var g2 = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int> {4,5,6},
            createdAt = DateTime.UtcNow.AddDays(-1)
        };

        await _db.Games.AddRangeAsync(g1, g2);
        await _db.SaveChangesAsync();

        var result = await _service.GetAllGames();

        Assert.Equal(2, result.Count());
        Assert.Contains(result, r => r.winningNums.SequenceEqual(new List<int> {1,2,3}));
        Assert.Contains(result, r => r.winningNums.SequenceEqual(new List<int> {4,5,6}));
    }

    [Fact]
    public async Task GetAllGames_Returns_Empty_When_NoCompletedGames()
    {
        await _db.Games.AddAsync(new Game { id = Guid.NewGuid(), numbers = new List<int>() }); // active game
        await _db.SaveChangesAsync();

        var result = await _service.GetAllGames();

        Assert.Empty(result);
    }

    // -------------------------
    // GetGameIncome
    // -------------------------
    [Fact]
    public async Task GetGameIncome_Returns_Income_When_ActiveGameExists()
    {
        var game = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int>(),
            income = 500
        };
        await _db.Games.AddAsync(game);
        await _db.SaveChangesAsync();

        var income = await _service.GetGameIncome();
        Assert.Equal(500, income);
    }

    [Fact]
    public async Task GetGameIncome_Throws_When_NoActiveGame()
    {
        await Assert.ThrowsAsync<Exception>(() => _service.GetGameIncome());
    }
}
