using Api.DTOs.Request;
using Api.DTOs.Response;

namespace Api.Services.Auth;

public interface IAuthService
{
    Task<UserLoginResDto> AuthenticateUser(UserLoginReqDto userLoginReqDto);
    Task Logout(string refreshToken);
    Task<(string token, string refresh)> RefreshToken(string refreshToken);
}