using Api.DTOs;
using Api.DTOs.Response;

namespace Api.Services.Auth;

public interface IAuthService
{
    Task<UserLoginResDTO> AuthenticateUser(UserLoginReqDTO userLoginReqDto);
    Task Logout(string refreshToken);
    Task<(string token, string refresh)> RefreshToken(string refreshToken);
}