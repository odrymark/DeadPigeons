using Api.DTOs;
using Api.DTOs.Response;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class MainService(TokenService tokenService, PigeonsDbContext pigeonsDbContext)
{
    public async Task<UserLoginResDTO> AuthenticateUser(UserLoginReqDTO userLoginReqDTO)
    {
        var user = await pigeonsDbContext.Users
            .FirstOrDefaultAsync(u => u.username == userLoginReqDTO.username);

        if (user == null || user.password != userLoginReqDTO.password)
            throw new Exception("Invalid login credentials");

        string token = tokenService.GenerateToken(user);
        
        user.lastLogin = DateTime.UtcNow;
        await pigeonsDbContext.SaveChangesAsync();

        return new UserLoginResDTO
        {
            id = user.id,
            username = user.username,
            isAdmin = user.isAdmin,
            token = token
        };
    }
}