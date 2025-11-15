using Api.DTOs;
using Api.DTOs.Response;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class MainService(TokenService tokenService, PigeonsDbContext _context)
{
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
}