using Api.DTOs.Request;
using Api.DTOs.Response;
using DataAccess;

namespace Api.Services.Boards;

public interface IBoardService
{
    Task<IEnumerable<Board>> GetBoardsForGame(Guid gameId);
    Task<IEnumerable<Board>> GetRepeatBoards();
    Task AddBoard(BoardReqDto boardReqDto, Guid userId, Game? newGame);
    Task<IEnumerable<BoardResDto>> GetBoards(Guid? id, string? username);
    Task EndRepeat(string id, Guid userId, bool isAdmin);
    Task<IEnumerable<BoardResDto>> GetCurrGameUserBoards(Guid userId);
    Task<IEnumerable<BoardResDto>> GetPrevGameUserBoards(Guid userId);
}