using Api.DTOs.Request;
using Api.Services.Boards;
using DataAccess;

namespace Api.Services.Games;

public class GameManager(IGameService gameService, IBoardService boardService, PigeonsDbContext context) : IGameManager
{
    public async Task AddWinningNumbers(WinningNumsReqDto dto)
    {
        var activeGame = await gameService.GetActiveGame();
        if (activeGame == null)
            throw new Exception("No active game available");

        IEnumerable<Board> boards = await boardService.GetBoardsForGame(activeGame.id);

        activeGame.numbers = dto.numbers;

        var enumerable = boards.ToList();
        var winningBoards = enumerable
            .Where(b => dto.numbers.All(n => b.numbers.Contains(n)))
            .ToList();

        foreach (var board in winningBoards)
        {
            board.isWinner = true;

            if (!activeGame.winners.Any(u => u.id == board.userId))
                activeGame.winners.Add(board.user);
        }

        foreach (var board in enumerable)
            if (!winningBoards.Contains(board))
                board.isWinner = false;

        var nextGameUtc = CalculateNextGameClose();
        var newGame = gameService.CreateNextGame(nextGameUtc);

        IEnumerable<Board> repeatBoards = await boardService.GetRepeatBoards();

        foreach (var old in repeatBoards)
        {
            try
            {
                var req = new BoardReqDto
                {
                    numbers = new List<int>(old.numbers),
                    repeats = old.repeats - 1
                };

                await boardService.AddBoard(req, old.userId, newGame);
                old.repeats = 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        await context.SaveChangesAsync();
    }

    private DateTime CalculateNextGameClose()
    {
        var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Copenhagen");
        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);

        int daysUntilSat = ((int)DayOfWeek.Saturday - (int)nowLocal.DayOfWeek + 7) % 7;
        var nextSatLocal = nowLocal.Date.AddDays(daysUntilSat).AddHours(17);

        if (nowLocal > nextSatLocal)
        {
            nextSatLocal = nextSatLocal.AddDays(7);
        }

        return TimeZoneInfo.ConvertTimeToUtc(nextSatLocal, tz);
    }
}