using Api.DTOs;
using Api.DTOs.Response;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class MainService(TokenService tokenService, PigeonsDbContext _context)
{
    public static readonly Dictionary<int, int> Prices = new()
    {
        { 5, 20 },
        { 6, 40 },
        { 7, 80 },
        { 8, 160 }
    };
    public async Task<UserLoginResDTO> AuthenticateUser(UserLoginReqDTO userLoginReqDTO)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.username == userLoginReqDTO.username);

        if (user == null || user.password != userLoginReqDTO.password)
            throw new Exception("Invalid login credentials");

        var token = tokenService.GenerateToken(user);

        user.lastLogin = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new UserLoginResDTO
        {
            id = user.id,
            username = user.username,
            isAdmin = user.isAdmin,
            token = token
        };
    }

    public async Task<IEnumerable<BoardResDTO>> GetBoards(Guid id)
    {
        return await _context.Boards
            .Where(b => b.userId == id)
            .Select(b => new BoardResDTO
            {
                id = b.id,
                numbers = b.numbers,
                createdAt = b.createdAt,
                isWinner = b.isWinner,
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<PaymentResDTO>> GetPayments(Guid id)
    {
        return await _context.Payments
            .Where(p => p.userId == id)
            .Select(p => new PaymentResDTO
            {
                id = p.id,
                createdAt = p.createdAt,
                amount = p.amount,
                paymentNumber = p.paymentNumber
            })
            .ToListAsync();
    }

    public async Task<int> GetBalance(Guid id)
    {
        return await _context.Payments
            .Where(p => p.userId == id)
            .SumAsync(p => p.amount);
    }

    public async Task AddBoard(BoardReqDTO boardReqDTO, Guid userId)
    {
        if (!Prices.TryGetValue(boardReqDTO.numbers.Count, out int price))
            throw new Exception("Amount of numbers not found in prices dictionary");
        
        int bal = await GetBalance(userId);

        if (bal < price)
            throw new Exception("Insufficient balance");
        
        var board = new Board
        {
            id = Guid.NewGuid(),
            userId = userId,
            numbers = boardReqDTO.numbers,
            createdAt = DateTime.UtcNow,
            isWinner = null
        };

        var payment = new Payment
        {
            id = Guid.NewGuid(),
            userId = userId,
            amount = -price,
            createdAt = DateTime.UtcNow,
            paymentNumber = null 
        };
            
        _context.Boards.Add(board);
        _context.Payments.Add(payment);
            
        await _context.SaveChangesAsync();
    }

}