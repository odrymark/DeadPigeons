using System.Security.Claims;
using Api.DTOs;
using Api.DTOs.Response;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("pigeon")]
public class MainController(MainService service) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] UserLoginReqDTO loginReqDto)
    {
        try
        {
            UserLoginResDTO response = await service.AuthenticateUser(loginReqDto);

            Response.Cookies.Append("jwt", response.token, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, //TEMPORARY, LATER CHANGE TO HTTPS
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(7),
            });

            return Ok(new
            {
                id = response.id,
                username = response.username,
                isAdmin = response.isAdmin
            });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public ActionResult Logout()
    {
        Response.Cookies.Delete("jwt");
        return Ok();
    }

    [HttpGet("auth/me")]
    [Authorize]
    public ActionResult GetMe()
    {
        return Ok(new
        {
            username = User.Identity?.Name,
            id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            isAdmin = User.FindFirst("isAdmin")?.Value == "True"
        });
    }

    [HttpGet("getBoards")]
    [Authorize]
    public async Task<ActionResult> GetBoards()
    {
        try
        {
            var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            Guid id = Guid.Parse(sub!);
            
            var boards = await service.GetBoards(id);
            return Ok(boards);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

}