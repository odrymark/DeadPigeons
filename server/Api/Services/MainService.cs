using System.Security.Authentication;
using Api.DTOs;
using Api.DTOs.Response;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class MainService(TokenService tokenService, PasswordService passwordService, PigeonsDbContext context)
{
    private static readonly Dictionary<int, int> Prices = new()
    {
        { 5, 20 },
        { 6, 40 },
        { 7, 80 },
        { 8, 160 }
    };

    public async Task<UserLoginResDTO> AuthenticateUser(UserLoginReqDTO userLoginReqDto)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.username == userLoginReqDto.username);

        if (user == null || !passwordService.VerifyHashedPassword(user.password, userLoginReqDto.password))
            throw new Exception("Invalid login credentials");

        var token = tokenService.GenerateToken(user);
        var refresh = tokenService.GenerateRefreshToken();

        user.lastLogin = DateTime.UtcNow;
        user.refreshToken = passwordService.HashRefreshToken(refresh);
        user.refreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await context.SaveChangesAsync();

        return new UserLoginResDTO
        {
            id = user.id,
            username = user.username,
            isAdmin = user.isAdmin,
            token = token,
            refreshToken = refresh
        };
    }

    public async Task<(string token, string refresh)> RefreshToken(string refreshToken)
    {
        try
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.refreshToken == passwordService.HashRefreshToken(refreshToken));

            if (user == null)
            {
                Console.WriteLine("Invalid refresh token");
                throw new Exception("Invalid refresh token");
            }

            if (user.refreshTokenExpiry < DateTime.UtcNow)
            {
                Console.WriteLine("Refresh token expired");
                throw new Exception("Refresh token expired");
            }
            
            var newRefresh = tokenService.GenerateRefreshToken();
            user.refreshToken = passwordService.HashRefreshToken(newRefresh);
            user.refreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            await context.SaveChangesAsync();
            
            var newToken = tokenService.GenerateToken(user);
        
            return (newToken, newRefresh);
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task Logout(string refreshToken)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.refreshToken == passwordService.HashRefreshToken(refreshToken));
        if (user == null)
            throw new Exception("User not found");
        
        user.refreshToken = null;
        user.refreshTokenExpiry = null;
        await context.SaveChangesAsync();
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

    public async Task AddBoard(BoardReqDTO boardReqDto, Guid userId)
    {
        if (!Prices.TryGetValue(boardReqDto.numbers.Count, out var price))
            throw new Exception("Amount of numbers not found in prices dictionary");

        var bal = await GetBalance(userId);

        if (bal < price)
            throw new Exception("Insufficient balance");

        var board = new Board
        {
            id = Guid.NewGuid(),
            userId = userId,
            numbers = boardReqDto.numbers,
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

    public async Task AddUser(UserAddReqDTO userAddReqDto, bool isAdmin)
    {
        if (!isAdmin)
            throw new Exception("No administrator privileges");

        bool exists = await context.Users.AnyAsync(u =>
            u.username == userAddReqDto.username ||
            u.email == userAddReqDto.email ||
            u.phoneNumber == userAddReqDto.phoneNumber
        );

        if (exists)
            throw new Exception("A user with the same username, email, or phone number already exists.");

        var user = new User
        {
            username = userAddReqDto.username,
            password = passwordService.HashPassword(userAddReqDto.password),
            email = userAddReqDto.email,
            phoneNumber = userAddReqDto.phoneNumber,
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

    public async Task AddWinningNumbers(WinningNumsReqDTO winningNumsReqDto, bool isAdmin)
    {
        try
        {
            if (!isAdmin)
                throw new Exception("No administrator privileges");
            
            var today = DateTime.UtcNow.Date;
            var diff = (7 + (int)today.DayOfWeek - (int)DayOfWeek.Monday) % 7;
            var startOfWeek = today.AddDays(-diff);
            var endOfWeek = startOfWeek.AddDays(7);
        
            var game = new Game
            {
                id = Guid.NewGuid(),
                numbers = new List<int>(winningNumsReqDto.numbers),
                winners = new List<User>(),
                income = 0,
                payed = 0
            };
        
            var boards = await context.Boards
                .Include(b => b.user)
                .ToListAsync();
        
            var winningBoards = boards
                .Where(b =>
                    b.createdAt.Date >= startOfWeek &&
                    b.createdAt.Date <= endOfWeek &&
                    winningNumsReqDto.numbers.All(n => b.numbers.Contains(n))
                )
                .ToList();
        
            foreach (var board in winningBoards)
            {
                board.isWinner = true;
                if (!game.winners.Any(u => u.id == board.userId))
                {
                    game.winners.Add(board.user);
                }
            }
            
            var currentWeekBoards = boards
                .Where(b => b.createdAt.Date >= startOfWeek && b.createdAt.Date <= endOfWeek)
                .ToList();
            
            foreach (var board in currentWeekBoards)
            {
                if (!winningBoards.Contains(board))
                {
                    board.isWinner = false;
                }
            }
        
            context.Games.Add(game);
            await context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            throw new Exception(e.Message);
        }
    }

    public async Task AddPayment(PaymentReqDTO paymentReqDto, bool isAdmin)
    {
        try
        {
            if (!isAdmin)
                throw new Exception("No administrator privileges");
            
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.username == paymentReqDto.username);
            
            if(user == null)
                throw new Exception("User not found with the specified username");

            var payment = new Payment
            {
                userId = user.id,
                amount = paymentReqDto.amount,
                paymentNumber = paymentReqDto.paymentNumber,
                createdAt = DateTime.UtcNow
            };
            
            context.Payments.Add(payment);
            await context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            throw new Exception(e.Message);
        }
    }
}