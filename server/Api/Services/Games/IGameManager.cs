using Api.DTOs.Request;

namespace Api.Services.Games;

public interface IGameManager
{
    Task AddWinningNumbers(WinningNumsReqDto dto);
}