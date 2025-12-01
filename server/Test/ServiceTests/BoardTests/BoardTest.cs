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
using Xunit.DependencyInjection;

namespace Test.ServiceTests.BoardTests;

[Startup(typeof(BoardStartup))]
public class BoardTest : TestBase
{
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
        IGameService games) : base(db)
    {
        _boardService = service;
        _paymentService = payment;
        _priceService = price;
        _userService = users;
        _gameService = games;
    }

    // ----------------------------------------------------
    // GetBoardsForGame
    // ----------------------------------------------------

    [Fact]
    public async Task GetBoardsForGame_Returns_List()
    {
        var game = await CreateGameAsync();
        var user = await CreateUserAsync();

        await CreateBoardAsync(user.id, game.id);

        var result = await _boardService.GetBoardsForGame(game.id);

        Assert.Single(result);
    }

    // ----------------------------------------------------
    // GetRepeatBoards
    // ----------------------------------------------------

    [Fact]
    public async Task GetRepeatBoards_Returns_Only_Repeaters()
    {
        var game = await CreateGameAsync();
        var user1 = await CreateUserAsync("user1");
        var user2 = await CreateUserAsync("user2");

        await CreateBoardAsync(user1.id, game.id, repeats: 2);
        await CreateBoardAsync(user2.id, game.id, repeats: 0);

        var result = await _boardService.GetRepeatBoards();

        Assert.Single(result);
    }

    // ----------------------------------------------------
    // GetCurrGameUserBoards
    // ----------------------------------------------------

    [Fact]
    public async Task GetCurrGameUserBoards_Returns_Boards()
    {
        var user = await CreateUserAsync("testuser");
        var game = await CreateGameAsync();

        _gameService.GetActiveGame().Returns(game);

        await CreateBoardAsync(user.id, game.id);

        var result = await _boardService.GetCurrGameUserBoards(user.id);

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
        var user = await CreateUserAsync("testuser");
        var game = await CreateGameAsync();

        _gameService.GetLastGame().Returns(game);

        await CreateBoardAsync(user.id, game.id, numbers: new List<int> { 4, 5, 6 });

        var result = await _boardService.GetPrevGameUserBoards(user.id);

        Assert.Single(result);
    }

    // ----------------------------------------------------
    // GetBoards
    // ----------------------------------------------------

    [Fact]
    public async Task GetBoards_ByUserId_Returns()
    {
        var user = await CreateUserAsync("testuser");
        var game = await CreateGameAsync();

        await CreateBoardAsync(user.id, game.id, numbers: new List<int> { 7, 8, 9 });

        var result = await _boardService.GetBoards(user.id, null);

        Assert.Single(result);
    }

    [Fact]
    public async Task GetBoards_ByUsername_Returns()
    {
        var user = await CreateUserAsync("bob");
        var game = await CreateGameAsync();

        _userService.GetUserByName("bob").Returns(user);

        await CreateBoardAsync(user.id, game.id, numbers: new List<int> { 1, 1, 1 });

        var result = await _boardService.GetBoards(null, "bob");

        Assert.Single(result);
    }

    // ----------------------------------------------------
    // AddBoard
    // ----------------------------------------------------

    [Fact]
    public async Task AddBoard_Adds_When_Valid()
    {
        var user = await CreateUserAsync("testuser");
        var game = await CreateGameAsync();

        _gameService.GetActiveGame().Returns(game);
        _paymentService.GetBalance(user.id).Returns(100);
        _priceService.GetPrice(Arg.Any<int>()).Returns(10);

        var req = new BoardReqDTO
        {
            numbers = new List<int> { 1, 2, 3 },
            repeats = 0
        };

        await _boardService.AddBoard(req, user.id, null);

        Assert.Equal(1, await Db.Boards.CountAsync());
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
        var user = await CreateUserAsync("testuser");
        var game = await CreateGameAsync();

        _gameService.GetActiveGame().Returns(game);
        _paymentService.GetBalance(user.id).Returns(1);
        _priceService.GetPrice(3).Returns(50);

        var req = new BoardReqDTO { numbers = [1, 2, 3] };

        await Assert.ThrowsAsync<Exception>(() =>
            _boardService.AddBoard(req, user.id, null));
    }

    [Fact]
    public async Task AddBoard_Throws_When_GameClosed()
    {
        var user = await CreateUserAsync("testuser");
        var game = await CreateGameAsync(isOpen: false);

        _gameService.GetActiveGame().Returns(game);

        var req = new BoardReqDTO { numbers = [1, 2, 3] };

        await Assert.ThrowsAsync<Exception>(() =>
            _boardService.AddBoard(req, user.id, null));
    }

    // ----------------------------------------------------
    // EndRepeat
    // ----------------------------------------------------

    [Fact]
    public async Task EndRepeat_Sets_Repeats_ToZero()
    {
        var user = await CreateUserAsync("testuser");
        var game = await CreateGameAsync();

        var board = await CreateBoardAsync(user.id, game.id, repeats: 5);

        await _boardService.EndRepeat(board.id.ToString(), user.id);

        var updatedBoard = await Db.Boards.FindAsync(board.id);
        Assert.Equal(0, updatedBoard.repeats);
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
        var user = await CreateUserAsync("testuser");
        var game = await CreateGameAsync();

        var board = await CreateBoardAsync(user.id, game.id);

        await Assert.ThrowsAsync<Exception>(() =>
            _boardService.EndRepeat(board.id.ToString(), Guid.NewGuid()));
    }
}