using Api.DTOs.Request;
using Api.DTOs.Response;
using DataAccess;

namespace Api.Services.Users;

public interface IUserService
{
    Task<IEnumerable<string>> GetAllUsers();
    Task<UserInfoResDto> GetUserInfo(string username);
    Task AddUser(UserAddReqDto userAddReqDto);
    Task<User> GetUserByName(string username);
}