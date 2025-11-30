using Api.DTOs;
using Api.Services.Boards;
using Api.Services.Games;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

public class ManagerTest
{
    private readonly PigeonsDbContext _db;
    private readonly GameManager _service;
    private readonly IGameService _gameService;
    private readonly IBoardService _boardService;

    public ManagerTest(PigeonsDbContext db)
    {
        _db = db;
        _db.Database.EnsureCreated();

        _gameService = Substitute.For<IGameService>();
        _boardService = Substitute.For<IBoardService>();

        _service = new GameManager(_gameService, _boardService, _db);
    }

    // -------------------------
    // AddWinningNumbers - Happy Path
    // -------------------------
    [Fact]
    public async Task AddWinningNumbers_MarksWinningBoards_AndCreatesNextGame()
    {
        var userId = Guid.NewGuid();
        var board = new Board
        {
            id = Guid.NewGuid(),
            userId = userId,
            numbers = new List<int> {1, 2, 3},
            user = new User { id = userId, username = "bob" }
        };

        var activeGame = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int>(),
            winners = new List<User>()
        };

        _gameService.GetActiveGame().Returns(activeGame);
        _boardService.GetBoardsForGame(activeGame.id).Returns(new List<Board> { board });
        _boardService.GetRepeatBoards().Returns(new List<Board>());

        _gameService.CreateNextGame(Arg.Any<DateTime>()).Returns(new Game { id = Guid.NewGuid() });

        var dto = new WinningNumsReqDTO
        {
            numbers = new List<int> {1, 2, 3}
        };

        await _service.AddWinningNumbers(dto);

        // Winning board marked
        Assert.True(board.isWinner);
        // Winner added to active game
        Assert.Contains(board.user, activeGame.winners);
        // Numbers updated
        Assert.Equal(dto.numbers, activeGame.numbers);
    }

    // -------------------------
    // AddWinningNumbers - No Active Game
    // -------------------------
    [Fact]
    public async Task AddWinningNumbers_Throws_When_NoActiveGame()
    {
        _gameService.GetActiveGame().Returns((Game?)null);

        var dto = new WinningNumsReqDTO { numbers = new List<int> {1,2,3} };

        await Assert.ThrowsAsync<Exception>(() => _service.AddWinningNumbers(dto));
    }

    // -------------------------
    // AddWinningNumbers - Repeat Boards Handling
    // -------------------------
    [Fact]
    public async Task AddWinningNumbers_ReappliesRepeatBoards()
    {
        var activeGame = new Game { id = Guid.NewGuid(), numbers = new List<int>(), winners = new List<User>() };
        _gameService.GetActiveGame().Returns(activeGame);

        var repeatBoard = new Board
        {
            id = Guid.NewGuid(),
            userId = Guid.NewGuid(),
            numbers = new List<int> {1,2,3},
            repeats = 2,
            user = new User { id = Guid.NewGuid(), username = "alice" }
        };

        var newGame = new Game { id = Guid.NewGuid() };
        _gameService.CreateNextGame(Arg.Any<DateTime>()).Returns(newGame);
        _boardService.GetBoardsForGame(activeGame.id).Returns(new List<Board>());
        _boardService.GetRepeatBoards().Returns(new List<Board> { repeatBoard });

        await _service.AddWinningNumbers(new WinningNumsReqDTO { numbers = new List<int> {1} });

        // Repeat board repeats are reset after being added to new game
        Assert.Equal(0, repeatBoard.repeats);
    }

    // -------------------------
    // AddWinningNumbers - Non-winning boards marked
    // -------------------------
    [Fact]
    public async Task AddWinningNumbers_SetsNonWinningBoardsToFalse()
    {
        var userId = Guid.NewGuid();
        var board1 = new Board { id = Guid.NewGuid(), userId = userId, numbers = new List<int> {1,2}, user = new User { id = userId, username = "bob" } };
        var board2 = new Board { id = Guid.NewGuid(), userId = Guid.NewGuid(), numbers = new List<int> {3,4}, user = new User { id = Guid.NewGuid(), username = "alice" } };

        var activeGame = new Game { id = Guid.NewGuid(), numbers = new List<int>(), winners = new List<User>() };
        _gameService.GetActiveGame().Returns(activeGame);
        _boardService.GetBoardsForGame(activeGame.id).Returns(new List<Board> { board1, board2 });
        _boardService.GetRepeatBoards().Returns(new List<Board>());
        _gameService.CreateNextGame(Arg.Any<DateTime>()).Returns(new Game { id = Guid.NewGuid() });

        await _service.AddWinningNumbers(new WinningNumsReqDTO { numbers = new List<int> {1,2} });

        Assert.True(board1.isWinner);
        Assert.False(board2.isWinner);
    }
}