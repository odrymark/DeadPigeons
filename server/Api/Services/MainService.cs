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
                    isWinner = b.isWinner
                })
                .ToListAsync();
        }
        else
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.username == username);
            
            if (user == null)
                throw new Exception("User not found");
            
            return await context.Boards
                .Where(b => b.userId == user.id)
                .Select(b => new BoardResDTO
                {
                    id = b.id,
                    numbers = b.numbers,
                    createdAt = b.createdAt,
                    isWinner = b.isWinner
                })
                .ToListAsync();
        }
    }

    public async Task<IEnumerable<GameResDTO>> GetAllGames()
    {
        try
        {
            var games = await context.Games
                .Include(g => g.winners)
                .Include(g => g.boards)
                .Where(g => g.numbers.Any())
                .OrderByDescending(g => g.createdAt)
                .ToListAsync();
            
            var response = games.Select(g => new GameResDTO
            {
                createdAt = g.createdAt,
                income = g.income,
                winningNums = g.numbers.ToList(),
                winners = g.winners.Select(w => new WinnersResDTO
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

    public async Task<IEnumerable<PaymentResDTO>> GetPayments(Guid? id, string? username)
    {
        if (string.IsNullOrEmpty(username))
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
        else
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.username == username);
            
            if (user == null)
                throw new Exception("User not found");
            
            return await context.Payments
                .Where(p => p.userId == user.id)
                .Select(p => new PaymentResDTO
                {
                    id = p.id,
                    createdAt = p.createdAt,
                    amount = p.amount,
                    paymentNumber = p.paymentNumber
                })
                .ToListAsync();
        }
    }

    public async Task<int> GetBalance(Guid id)
    {
        return await context.Payments
            .Where(p => p.userId == id)
            .SumAsync(p => p.amount);
    }

    public async Task AddBoard(BoardReqDTO boardReqDto, Guid userId)
    {
        var activeGame = await context.Games
            .FirstOrDefaultAsync(g => g.numbers.Count == 0);
        
        if (activeGame == null)
            throw new Exception("No active game available");
        
        if (!Prices.TryGetValue(boardReqDto.numbers.Count, out var price))
            throw new Exception("Amount of numbers not found in prices dictionary");

        var bal = await GetBalance(userId);

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
        
        activeGame.income += price;

        context.Boards.Add(board);
        context.Payments.Add(payment);

        await context.SaveChangesAsync();
    }

    public async Task AddUser(UserAddReqDTO userAddReqDto)
    {
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
    
    public async Task<int> GetGameIncome()
    {
        var game = await context.Games
            .FirstOrDefaultAsync(g => g.numbers.Count == 0);

        if (game == null)
            throw new Exception("No active game available");

        return game.income;
    }

    public async Task AddWinningNumbers(WinningNumsReqDTO winningNumsReqDto)
    {
        try
        {
            var activeGame = await context.Games
                .Include(g => g.winners)
                .FirstOrDefaultAsync(g => g.numbers.Count == 0);

            if (activeGame == null)
                throw new Exception("No active game available");

            var boards = await context.Boards
                .Include(b => b.user)
                .Where(b => b.gameId == activeGame.id)
                .ToListAsync();

            activeGame.numbers = winningNumsReqDto.numbers;

            var winningBoards = boards
                .Where(b => winningNumsReqDto.numbers.All(n => b.numbers.Contains(n)))
                .ToList();

            foreach (var board in winningBoards)
            {
                board.isWinner = true;

                if (activeGame.winners.All(u => u.id != board.userId))
                {
                    activeGame.winners.Add(board.user);
                }
            }

            foreach (var board in boards)
            {
                if (!winningBoards.Contains(board))
                    board.isWinner = false;
            }
            
            var danishTz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Copenhagen");
            var localTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, danishTz);

            int daysUntilSaturday = ((int)DayOfWeek.Saturday - (int)localTime.DayOfWeek + 7) % 7;
            
            var nextSaturdayLocal = localTime.Date.AddDays(daysUntilSaturday)
                .AddHours(17);

            var openUntilUtc = TimeZoneInfo.ConvertTimeToUtc(nextSaturdayLocal, danishTz);

            var newGame = new Game
            {
                id = Guid.NewGuid(),
                numbers = new List<int>(),
                income = 0,
                createdAt = DateTime.UtcNow,
                openUntil = openUntilUtc,
            };

            context.Games.Add(newGame);

            await context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            throw new Exception(e.Message);
        }
    }

    public async Task<IEnumerable<string>> GetAllUsers()
    {
        try
        {
            var users = await context.Users
                .Select(u => u.username)
                .ToListAsync();
            
            return users;
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task<UserInfoResDTO> GetUserInfo(string username)
    {
        try
        {
            var user = await context.Users
                .Where(u => u.username == username)
                .FirstOrDefaultAsync();
            if (user == null)
                throw new Exception("No user found");

            return new UserInfoResDTO
            {
                username = user.username,
                createdAt = user.createdAt,
                lastLogin = user.lastLogin,
                isActive = user.isActive,
                email = user.email,
                phoneNumber = user.phoneNumber,
            };
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task AddPayment(PaymentReqDTO paymentReqDto)
    {
        try
        {
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