using Api.DTOs.Request;
using Api.DTOs.Response;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Api.Services.Games;

public class GameService(PigeonsDbContext context) : IGameService
{
    public async Task<Game?> GetActiveGame()
    {
        return await context.Games
            .Include(g => g.winners)
            .FirstOrDefaultAsync(g => g.numbers.Count == 0);
    }
    
    public async Task<GameCloseResDto> GetCurrGameClosing()
    {
        var currGame = await context.Games
            .FirstOrDefaultAsync(g => g.numbers.Count == 0);
        
        if (currGame == null)
            throw new Exception("No active game found");

        return new  GameCloseResDto
        {
            closeDate = currGame.openUntil
        };
    }
        
    public async Task<IEnumerable<int>> GetLastGameNums()
    {
        var game = await GetLastGame();
        return game.numbers;
    }

    public async Task<Game> GetLastGame()
    {
        var game = await context.Games
            .Where(g => g.numbers.Any())
            .OrderByDescending(g => g.createdAt)
            .FirstOrDefaultAsync();
        
        if (game == null)
            throw new Exception("No previous game found");
        
        return game;
    }
    
    public Game CreateNextGame(DateTime openUntilUtc)
    {
        var newGame = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int>(),
            income = 0,
            createdAt = DateTime.UtcNow,
            openUntil = openUntilUtc
        };

        context.Games.Add(newGame);
        return newGame;
    }
    
    public async Task<IEnumerable<GameResDto>> GetAllGames()
    {
        try
        {
            var games = await context.Games
                .Include(g => g.winners)
                .Include(g => g.boards)
                .Where(g => g.numbers.Any())
                .OrderByDescending(g => g.createdAt)
                .ToListAsync();
            
            var response = games.Select(g => new GameResDto
                {
                    id = g.id.ToString(),
                    createdAt = g.createdAt,
                    income = g.income,
                    winningNums = g.numbers.ToList(),
                    winners = g.winners.Select(w => new WinnersResDto
                    {
                        username = w.username,
                        winningBoardsNum = g.boards.Count(b => b.userId == w.id && b.isWinner == true)
                    }).ToList()
                })
                .OrderByDescending(x => x.createdAt)
                .ToList();

            return response;
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }
}