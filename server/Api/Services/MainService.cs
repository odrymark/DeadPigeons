using Api.DTOs;
using Api.DTOs.Response;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class MainService(TokenService tokenService, PasswordService passwordService, PigeonsDbContext context)
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
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.username == userLoginReqDTO.username);

        if (user == null || !passwordService.VerifyHashedPassword(user.password, userLoginReqDTO.password))
            throw new Exception("Invalid login credentials");

        var token = tokenService.GenerateToken(user);

        user.lastLogin = DateTime.UtcNow;
        await context.SaveChangesAsync();

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
        return await context.Boards
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
        return await context.Payments
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
        return await context.Payments
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

        context.Boards.Add(board);
        context.Payments.Add(payment);

        await context.SaveChangesAsync();
    }

    public async Task AddUser(UserAddReqDTO userAddReqDTO, bool isAdmin)
    {
        if (!isAdmin)
            throw new Exception("No admin privileges");

        bool exists = await context.Users.AnyAsync(u =>
            u.username == userAddReqDTO.username ||
            u.email == userAddReqDTO.email ||
            u.phoneNumber == userAddReqDTO.phoneNumber
        );

        if (exists)
            throw new Exception("A user with the same username, email, or phone number already exists.");

        var user = new User
        {
            username = userAddReqDTO.username,
            password = passwordService.HashPassword(userAddReqDTO.password),
            email = userAddReqDTO.email,
            phoneNumber = userAddReqDTO.phoneNumber,
            isAdmin = false,
            isActive = false,
            lastLogin = DateTime.UtcNow,
            createdAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();
    }
    
    public async Task<int> GetWeekIncome()
    {
        var today = DateTime.UtcNow.Date;
        var diff = (7 + (int)today.DayOfWeek - (int)DayOfWeek.Monday) % 7;
        var startOfWeek = today.AddDays(-diff);
        var endOfWeek = startOfWeek.AddDays(7);

        var weekIncome = await context.Payments
            .Where(p => p.amount < 0 && p.createdAt.Date >= startOfWeek && p.createdAt.Date <= endOfWeek)
            .SumAsync(p => -p.amount);

        return weekIncome;
    }

}