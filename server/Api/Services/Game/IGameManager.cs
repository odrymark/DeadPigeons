using Api.DTOs;

namespace Api.Services.Games;

public interface IGameManager
{
    Task AddWinningNumbers(WinningNumsReqDTO dto);
}