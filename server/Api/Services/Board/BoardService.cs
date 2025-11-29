using Api.DTOs;
using Api.DTOs.Response;
using Api.Services.Games;
using Api.Services.Payments;
using api.Services.Price;
using Api.Services.Users;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Api.Services.Boards;

public class BoardService(PigeonsDbContext context, IPaymentService paymentService, IPriceService priceService, IUserService userService, IGameService gameService) : IBoardService
{
    public async Task<IEnumerable<Board>> GetBoardsForGame(Guid gameId)
    {
        return await context.Boards
            .Include(b => b.user)
            .Where(b => b.gameId == gameId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Board>> GetRepeatBoards()
    {
        return await context.Boards
            .Where(b => b.repeats > 0)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<BoardResDTO>> GetBoards(Guid? id, string? username)
    {
        if (string.IsNullOrEmpty(username))
        {
            return await context.Boards
                .Where(b => b.userId == id)
                .Select(b => new BoardResDTO
                {
                    id = b.id,
                    numbers = b.numbers,
                    createdAt = b.createdAt,
                    isWinner = b.isWinner,
                    repeats = b.repeats
                })
                .ToListAsync();
        }
        
        var user = await userService.GetUserByName(username);
            
        return await context.Boards
            .Where(b => b.userId == user.id)
            .Select(b => new BoardResDTO
            {
                id = b.id,
                numbers = b.numbers,
                createdAt = b.createdAt,
                isWinner = b.isWinner,
                repeats = b.repeats
            })
            .ToListAsync();
    }
    
    public async Task AddBoard(BoardReqDTO boardReqDto, Guid userId, Game? newGame)
    {
        Game? activeGame;
        if (newGame == null)
        {
            activeGame = await gameService.GetActiveGame();
        }
        else
            activeGame = newGame;
        
        
        if (activeGame == null)
            throw new Exception("No active game available");
        
        var price = priceService.GetPrice(boardReqDto.numbers.Count);

        var bal = await paymentService.GetBalance(userId);

        if (bal < price)
            throw new Exception("Insufficient balance");

        if (DateTime.UtcNow > activeGame.openUntil)
            throw new Exception("The current game is closed for new boards");
        
        var board = new Board
        {
            id = Guid.NewGuid(),
            userId = userId,
            gameId = activeGame.id,
            numbers = boardReqDto.numbers,
            createdAt = DateTime.UtcNow,
            isWinner = null,
            repeats = boardReqDto.repeats,
        };

        await paymentService.CreateBuyPayment(price, userId);
        
        activeGame.income += price;

        context.Boards.Add(board);

        await context.SaveChangesAsync();
    }

    public async Task EndRepeat(string id, Guid userId)
    {
        try
        {
            if (!Guid.TryParse(id, out var boardId))
                throw new Exception("Invalid board ID");

            var board = await context.Boards
                .FirstOrDefaultAsync(b => b.id == boardId);

            if (board == null)
                throw new Exception("Board not found");

            if (board.userId != userId)
                throw new Exception("You do not own this board");

            board.repeats = 0;

            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }
}