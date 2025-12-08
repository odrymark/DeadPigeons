using Api.DTOs.Request;
using Api.DTOs.Response;
using DataAccess;

namespace Api.Services.Users;

public interface IUserService
{
    Task<IEnumerable<UserInfoResDto>> GetAllUsers();
    Task<UserInfoResDto> GetUserInfo(Guid id);
    Task AddUser(UserAddReqDto userAddReqDto);
    Task<User> GetUserByName(string username);
    Task<User> GetUserById(Guid userId);
}