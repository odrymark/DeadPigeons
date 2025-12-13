using Api.DTOs.Request;
using Api.DTOs.Response;
using Api.Services.Password;
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

    public async Task<User> GetUserById(Guid userId)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.id == userId);
        
        if (user == null)
            throw new Exception("User not found");
        
        return user;
    }
    
    public async Task<IEnumerable<UserInfoResDto>> GetAllUsers()
    {
        try
        {
            var users = await context.Users
                .Select(u => new UserInfoResDto
                {
                    id = u.id.ToString(),
                    username = u.username
                })
                .ToListAsync();
        
            return users;
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task<UserInfoResDto> GetUserInfo(Guid id)
    {
        try
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.id == id);
        
            if (user == null)
                throw new Exception("User not found");

            return new UserInfoResDto
            {
                id = user.id.ToString(),
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

    public async Task EditUser(UserEditReqDto userEditReqDto)
    {
        var id = Guid.Parse(userEditReqDto.id);
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.id == id);
        
        if (user == null)
            throw new Exception("User not found");
        
        user.username = userEditReqDto.username;
        user.email = userEditReqDto.email;
        user.phoneNumber = userEditReqDto.phoneNumber;
        user.isActive = userEditReqDto.isActive;

        if (!string.IsNullOrEmpty(userEditReqDto.password))
        {
            if (userEditReqDto.password.Length < 8)
                throw new Exception("Password must be at least 8 characters.");
            
            user.password = passwordService.HashPassword(userEditReqDto.password);
        }
        
        await context.SaveChangesAsync();
    }
}