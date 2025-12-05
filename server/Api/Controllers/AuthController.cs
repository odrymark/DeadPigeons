using System.Security.Claims;
using Api.DTOs.Request.Request;
using Api.DTOs.Response;
using Api.Services;
using Api.Services.Auth;
using api.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService service, IOptions<AuthSettings> options) : ControllerBase
{
    private readonly AuthSettings _settings = options.Value;
    private double JwtExpireMinutes => _settings.JwtExpireMinutes;
    private double RefreshExpireDays => _settings.RefreshExpireDays;
    
    private void SetJwtCookie(string token)
    {
        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddMinutes(JwtExpireMinutes)
        });
    }
    
    private void SetRefreshCookie(string refreshToken)
    {
        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(RefreshExpireDays)
        });
    }
    
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] UserLoginReqDto loginReqDto)
    {
        UserLoginResDto output = await service.AuthenticateUser(loginReqDto);

        SetJwtCookie(output.token);
        SetRefreshCookie(output.refreshToken);

        var res = new GetMeResDto
        {
            id = output.id,
            username = output.username,
            isAdmin = output.isAdmin 
        };
            
        return Ok(res);
    }
    
    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<ActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await service.Logout(refreshToken);
        }
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(-1)
        };
        
        Response.Cookies.Delete("jwt", cookieOptions);
        Response.Cookies.Delete("refreshToken", cookieOptions);
        return Ok();
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult GetMe()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var res = new GetMeResDto
        {
            id = userId,
            username = User.Identity?.Name!,
            isAdmin = User.IsInRole("Admin")
        };

        return Ok(res);
    }

    [HttpPost("refresh")] 
    [AllowAnonymous] 
    public async Task<ActionResult> Refresh()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized("Missing refresh token");
        
        var (token, refresh) = await service.RefreshToken(refreshToken);
        
        SetJwtCookie(token);
        SetRefreshCookie(refresh);
        
        return Ok();
    }
}