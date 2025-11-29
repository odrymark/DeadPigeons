using Api.DTOs.Response;
using DataAccess;

namespace Api.Services.Games;

public interface IGameService
{
    Task<Game?> GetActiveGame();
    Game CreateNextGame(DateTime openUntilUtc);
    Task<IEnumerable<GameResDTO>> GetAllGames();
    Task<int> GetGameIncome();
}