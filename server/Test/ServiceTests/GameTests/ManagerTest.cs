using Api.DTOs.Request;
using Api.Services.Boards;
using Api.Services.Games;
using DataAccess;
using NSubstitute;
using Xunit;
using Xunit.DependencyInjection;

namespace Test.ServiceTests.GameTests;

[Startup(typeof(ManagerStartup))]
public class ManagerTest : TestBase
{
    private readonly GameManager _service;
    private readonly IGameService _gameService;
    private readonly IBoardService _boardService;

    public ManagerTest(PigeonsDbContext db, GameManager service, IGameService gameService, IBoardService boardService) : base(db)
    {
        _service = service;
        _gameService = gameService;
        _boardService = boardService;
    }

    // -------------------------
    // AddWinningNumbers Tests
    // -------------------------
    [Fact]
    public async Task AddWinningNumbers_MarksWinningBoards_AndCreatesNextGame()
    {
        var user = await CreateUserAsync("bob");
        var activeGame = await CreateGameAsync(true);
        var board = new Board
        {
            id = Guid.NewGuid(),
            userId = user.id,
            numbers = new List<int> {1, 2, 3},
            user = user
        };

        _gameService.GetActiveGame().Returns(activeGame);
        _boardService.GetBoardsForGame(activeGame.id).Returns(new List<Board> { board });
        _boardService.GetRepeatBoards().Returns(new List<Board>());

        _gameService.CreateNextGame(Arg.Any<DateTime>()).Returns(new Game { id = Guid.NewGuid() });

        var dto = new WinningNumsReqDto
        {
            numbers = new List<int> {1, 2, 3}
        };

        await _service.AddWinningNumbers(dto);

        Assert.True(board.isWinner);
        Assert.Contains(board.user, activeGame.winners);
        Assert.Equal(dto.numbers, activeGame.numbers);
    }
    
    [Fact]
    public async Task AddWinningNumbers_Throws_When_NoActiveGame()
    {
        _gameService.GetActiveGame().Returns((Game?)null);

        var dto = new WinningNumsReqDto { numbers = new List<int> {1,2,3} };

        await Assert.ThrowsAsync<Exception>(() => _service.AddWinningNumbers(dto));
    }
    
    [Fact]
    public async Task AddWinningNumbers_ReappliesRepeatBoards()
    {
        var activeGame = await CreateGameAsync(true);
        var user = await CreateUserAsync("alice");
        var repeatBoard = new Board
        {
            id = Guid.NewGuid(),
            userId = user.id,
            numbers = new List<int> {1,2,3},
            repeats = 2,
            user = user
        };

        var newGame = new Game { id = Guid.NewGuid() };
        _gameService.GetActiveGame().Returns(activeGame);
        _gameService.CreateNextGame(Arg.Any<DateTime>()).Returns(newGame);
        _boardService.GetBoardsForGame(activeGame.id).Returns(new List<Board>());
        _boardService.GetRepeatBoards().Returns(new List<Board> { repeatBoard });

        await _service.AddWinningNumbers(new WinningNumsReqDto { numbers = new List<int> {1} });

        Assert.Equal(0, repeatBoard.repeats);
    }
    
    [Fact]
    public async Task AddWinningNumbers_SetsNonWinningBoardsToFalse()
    {
        var activeGame = await CreateGameAsync(true);
        var user1 = await CreateUserAsync("bob");
        var user2 = await CreateUserAsync("alice");
        var board1 = new Board { id = Guid.NewGuid(), userId = user1.id, numbers = new List<int> {1,2}, user = user1 };
        var board2 = new Board { id = Guid.NewGuid(), userId = user2.id, numbers = new List<int> {3,4}, user = user2 };

        _gameService.GetActiveGame().Returns(activeGame);
        _boardService.GetBoardsForGame(activeGame.id).Returns(new List<Board> { board1, board2 });
        _boardService.GetRepeatBoards().Returns(new List<Board>());
        _gameService.CreateNextGame(Arg.Any<DateTime>()).Returns(new Game { id = Guid.NewGuid() });

        await _service.AddWinningNumbers(new WinningNumsReqDto { numbers = new List<int> {1,2} });

        Assert.True(board1.isWinner);
        Assert.False(board2.isWinner);
    }
}