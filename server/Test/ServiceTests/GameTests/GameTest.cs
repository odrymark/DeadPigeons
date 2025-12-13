using Api.Services.Games;
using DataAccess;
using Xunit;
using Xunit.DependencyInjection;

namespace Test.ServiceTests.GameTests;

[Startup(typeof(GameStartup))]
public class GameTest : TestBase
{
    private readonly IGameService _service;

    public GameTest(PigeonsDbContext db, IGameService service) : base(db)
    {
        _service = service;
    }

    // -------------------------
    // GetActiveGame
    // -------------------------
    [Fact]
    public async Task GetActiveGame_Returns_Game_When_Exists()
    {
        var game = await CreateGameAsync(true);

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
        var game = await CreateGameAsync(true);

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
        var lastGame = await CreateGameAsync(false);
        lastGame.numbers = new List<int> { 4, 5, 6 };
        lastGame.createdAt = DateTime.UtcNow.AddDays(-1);
        Db.Games.Update(lastGame);
        await Db.SaveChangesAsync();

        var oldGame = await CreateGameAsync(false);
        oldGame.numbers = new List<int> { 1, 2, 3 };
        oldGame.createdAt = DateTime.UtcNow.AddDays(-2);
        Db.Games.Update(oldGame);
        await Db.SaveChangesAsync();

        var result = await _service.GetLastGame();
        Assert.Equal(lastGame.id, result.id);
    }

    [Fact]
    public async Task GetLastGame_Throws_When_NoPreviousGame()
    {
        await CreateGameAsync(true);

        await Assert.ThrowsAsync<Exception>(() => _service.GetLastGame());
    }

    // -------------------------
    // GetLastGameNums
    // -------------------------
    [Fact]
    public async Task GetLastGameNums_Returns_Numbers()
    {
        var lastGame = await CreateGameAsync(false);
        lastGame.numbers = new List<int> { 1, 2, 3 };
        lastGame.createdAt = DateTime.UtcNow.AddDays(-1);
        Db.Games.Update(lastGame);
        await Db.SaveChangesAsync();

        var oldGame = await CreateGameAsync(false);
        oldGame.numbers = new List<int> { 7, 8, 9 };
        oldGame.createdAt = DateTime.UtcNow.AddDays(-2);
        Db.Games.Update(oldGame);
        await Db.SaveChangesAsync();

        var result = await _service.GetLastGameNums();

        Assert.Equal(new List<int> { 1, 2, 3 }, result);
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
        Assert.Contains(game, Db.Games.Local);
    }

    // -------------------------
    // GetAllGames
    // -------------------------
    [Fact]
    public async Task GetAllGames_Returns_CompletedGames()
    {
        var g1 = await CreateGameAsync(false);
        g1.numbers = new List<int> { 1, 2, 3 };
        g1.createdAt = DateTime.UtcNow.AddDays(-2);
        Db.Games.Update(g1);
        await Db.SaveChangesAsync();

        var g2 = await CreateGameAsync(false);
        g2.numbers = new List<int> { 4, 5, 6 };
        g2.createdAt = DateTime.UtcNow.AddDays(-1);
        Db.Games.Update(g2);
        await Db.SaveChangesAsync();

        var result = await _service.GetAllGames();

        Assert.Equal(2, result.Count());
        Assert.Contains(result, r => r.winningNums.SequenceEqual(new List<int> { 1, 2, 3 }));
        Assert.Contains(result, r => r.winningNums.SequenceEqual(new List<int> { 4, 5, 6 }));
    }

    [Fact]
    public async Task GetAllGames_Returns_Empty_When_NoCompletedGames()
    {
        await CreateGameAsync(true);

        var result = await _service.GetAllGames();

        Assert.Empty(result);
    }
}