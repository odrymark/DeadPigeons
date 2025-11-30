using Api.DTOs;
using Api.DTOs.Response;
using Api.Services.Boards;
using Api.Services.Games;
using Api.Services.Payments;
using api.Services.Price;
using Api.Services.Users;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

public class BoardTest
{
    private readonly PigeonsDbContext _db;
    private readonly IBoardService _boardService;
    private readonly IPaymentService _paymentService;
    private readonly IPriceService _priceService;
    private readonly IUserService _userService;
    private readonly IGameService _gameService;

    public BoardTest(
        PigeonsDbContext db,
        IBoardService service,
        IPaymentService payment,
        IPriceService price,
        IUserService users,
        IGameService games)
    {
        _db = db;
        _boardService = service;
        _paymentService = payment;
        _priceService = price;
        _userService = users;
        _gameService = games;

        db.Database.EnsureCreated();
    }

    // ----------------------------------------------------
    // GetBoardsForGame
    // ----------------------------------------------------

    [Fact]
    public async Task GetBoardsForGame_Returns_List()
    {
        var gameId = Guid.NewGuid();

        await _db.Boards.AddAsync(new Board
        {
            id = Guid.NewGuid(),
            gameId = gameId,
            userId = Guid.NewGuid(),
            numbers = [1, 2, 3]
        });

        await _db.SaveChangesAsync();

        var result = await _boardService.GetBoardsForGame(gameId);

        Assert.Single(result);
    }

    // ----------------------------------------------------
    // GetRepeatBoards
    // ----------------------------------------------------

    [Fact]
    public async Task GetRepeatBoards_Returns_Only_Repeaters()
    {
        await _db.Boards.AddRangeAsync(
            new Board { id = Guid.NewGuid(), repeats = 2 },
            new Board { id = Guid.NewGuid(), repeats = 0 }
        );

        await _db.SaveChangesAsync();

        var result = await _boardService.GetRepeatBoards();

        Assert.Single(result);
    }

    // ----------------------------------------------------
    // GetCurrGameUserBoards
    // ----------------------------------------------------

    [Fact]
    public async Task GetCurrGameUserBoards_Returns_Boards()
    {
        var userId = Guid.NewGuid();
        var game = new Game
        {
            id = Guid.NewGuid(),
            openUntil = DateTime.UtcNow.AddDays(1)
        };

        _gameService.GetActiveGame().Returns(game);

        await _db.Boards.AddAsync(new Board
        {
            id = Guid.NewGuid(),
            gameId = game.id,
            userId = userId,
            numbers = [1, 2, 3]
        });

        await _db.SaveChangesAsync();

        var result = await _boardService.GetCurrGameUserBoards(userId);

        Assert.Single(result);
    }

    [Fact]
    public async Task GetCurrGameUserBoards_Throws_When_NoActiveGame()
    {
        _gameService.GetActiveGame().Returns((Game?)null);

        await Assert.ThrowsAsync<Exception>(() =>
            _boardService.GetCurrGameUserBoards(Guid.NewGuid()));
    }

    // ----------------------------------------------------
    // GetPrevGameUserBoards
    // ----------------------------------------------------

    [Fact]
    public async Task GetPrevGameUserBoards_Returns_Boards()
    {
        var userId = Guid.NewGuid();
        var game = new Game { id = Guid.NewGuid() };

        _gameService.GetLastGame().Returns(game);

        await _db.Boards.AddAsync(new Board
        {
            id = Guid.NewGuid(),
            gameId = game.id,
            userId = userId,
            numbers = [4, 5, 6]
        });

        await _db.SaveChangesAsync();

        var result = await _boardService.GetPrevGameUserBoards(userId);

        Assert.Single(result);
    }

    // ----------------------------------------------------
    // GetBoards
    // ----------------------------------------------------

    [Fact]
    public async Task GetBoards_ByUserId_Returns()
    {
        var userId = Guid.NewGuid();

        await _db.Boards.AddAsync(new Board
        {
            id = Guid.NewGuid(),
            userId = userId,
            numbers = [7, 8, 9]
        });

        await _db.SaveChangesAsync();

        var result = await _boardService.GetBoards(userId, null);

        Assert.Single(result);
    }

    [Fact]
    public async Task GetBoards_ByUsername_Returns()
    {
        var userId = Guid.NewGuid();

        var testUser = new User
        {
            id = userId,
            username = "bob"
        };

        _userService.GetUserByName("bob").Returns(testUser);

        await _db.Boards.AddAsync(new Board
        {
            id = Guid.NewGuid(),
            userId = userId,
            numbers = [1, 1, 1]
        });

        await _db.SaveChangesAsync();

        var result = await _boardService.GetBoards(null, "bob");

        Assert.Single(result);
    }

    // ----------------------------------------------------
    // AddBoard
    // ----------------------------------------------------

    [Fact]
    public async Task AddBoard_Adds_When_Valid()
    {
        var userId = Guid.NewGuid();
        var game = new Game
        {
            id = Guid.NewGuid(),
            openUntil = DateTime.UtcNow.AddHours(1)
        };

        _gameService.GetActiveGame().Returns(game);
        _paymentService.GetBalance(userId).Returns(100);
        _priceService.GetPrice(Arg.Any<int>()).Returns(10);

        var req = new BoardReqDTO
        {
            numbers = new List<int> { 1, 2, 3 },
            repeats = 0
        };

        await _boardService.AddBoard(req, userId, null);

        Assert.Equal(1, _db.Boards.Count());
    }

    [Fact]
    public async Task AddBoard_Throws_When_NoActiveGame()
    {
        _gameService.GetActiveGame().Returns((Game?)null);

        var req = new BoardReqDTO { numbers = [1, 2] };

        await Assert.ThrowsAsync<Exception>(() =>
            _boardService.AddBoard(req, Guid.NewGuid(), null));
    }

    [Fact]
    public async Task AddBoard_Throws_When_InsufficientBalance()
    {
        var userId = Guid.NewGuid();
        var game = new Game
        {
            id = Guid.NewGuid(),
            openUntil = DateTime.UtcNow.AddHours(1)
        };

        _gameService.GetActiveGame().Returns(game);
        _paymentService.GetBalance(userId).Returns(1);
        _priceService.GetPrice(3).Returns(50);

        var req = new BoardReqDTO { numbers = [1, 2, 3] };

        await Assert.ThrowsAsync<Exception>(() =>
            _boardService.AddBoard(req, userId, null));
    }

    [Fact]
    public async Task AddBoard_Throws_When_GameClosed()
    {
        var userId = Guid.NewGuid();
        var game = new Game
        {
            id = Guid.NewGuid(),
            openUntil = DateTime.UtcNow.AddHours(-1)
        };

        _gameService.GetActiveGame().Returns(game);

        var req = new BoardReqDTO { numbers = [1, 2, 3] };

        await Assert.ThrowsAsync<Exception>(() =>
            _boardService.AddBoard(req, userId, null));
    }

    // ----------------------------------------------------
    // EndRepeat
    // ----------------------------------------------------

    [Fact]
    public async Task EndRepeat_Sets_Repeats_ToZero()
    {
        var userId = Guid.NewGuid();
        var board = new Board
        {
            id = Guid.NewGuid(),
            userId = userId,
            repeats = 5
        };

        await _db.Boards.AddAsync(board);
        await _db.SaveChangesAsync();

        await _boardService.EndRepeat(board.id.ToString(), userId);

        Assert.Equal(0, board.repeats);
    }

    [Fact]
    public async Task EndRepeat_Throws_InvalidId()
    {
        await Assert.ThrowsAsync<Exception>(() =>
            _boardService.EndRepeat("not-a-guid", Guid.NewGuid()));
    }

    [Fact]
    public async Task EndRepeat_Throws_NotOwner()
    {
        var board = new Board
        {
            id = Guid.NewGuid(),
            userId = Guid.NewGuid()
        };

        await _db.Boards.AddAsync(board);
        await _db.SaveChangesAsync();

        await Assert.ThrowsAsync<Exception>(() =>
            _boardService.EndRepeat(board.id.ToString(), Guid.NewGuid()));
    }
}
