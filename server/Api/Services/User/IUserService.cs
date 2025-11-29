using Api.DTOs;
using Api.DTOs.Response;
using DataAccess;

namespace Api.Services.Users;

public interface IUserService
{
    Task<IEnumerable<string>> GetAllUsers();
    Task<UserInfoResDTO> GetUserInfo(string username);
    Task AddUser(UserAddReqDTO userAddReqDto);
    Task<User> GetUserByName(string username);
}