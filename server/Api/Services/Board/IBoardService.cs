using Api.DTOs;
using Api.DTOs.Response;
using DataAccess;

namespace Api.Services.Boards;

public interface IBoardService
{
    Task<IEnumerable<Board>> GetBoardsForGame(Guid gameId);
    Task<IEnumerable<Board>> GetRepeatBoards();
    Task AddBoard(BoardReqDTO boardReqDto, Guid userId, Game? newGame);
    Task<IEnumerable<BoardResDTO>> GetBoards(Guid? id, string? username);
    Task EndRepeat(string id, Guid userId, bool isAdmin);
    Task<IEnumerable<BoardResDTO>> GetCurrGameUserBoards(Guid userId);
    Task<IEnumerable<BoardResDTO>> GetPrevGameUserBoards(Guid userId);
}