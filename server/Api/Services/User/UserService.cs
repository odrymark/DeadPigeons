using Api.DTOs.Request;
using Api.DTOs.Response;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Api.Services.Users;

public class UserService(PigeonsDbContext context, IPasswordService passwordService) : IUserService
{
    public async Task<User> GetUserByName(string username)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.username == username);
        
        if (user == null)
            throw new Exception("User not found");
        
        return user;
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

    public async Task<UserInfoResDto> GetUserInfo(string username)
    {
        try
        {
            var user = await context.Users
                .Where(u => u.username == username)
                .FirstOrDefaultAsync();
            if (user == null)
                throw new Exception("No user found");

            return new UserInfoResDto
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
    
    public async Task AddUser(UserAddReqDto userAddReqDto)
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
}