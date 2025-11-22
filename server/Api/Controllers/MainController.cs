using System.Security.Claims;
using Api.DTOs;
using Api.DTOs.Response;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("pigeon")]
public class MainController(MainService service, IConfiguration configuration) : ControllerBase
{
    
    private readonly double _jwtExpireMin = double.Parse(configuration["Jwt:ExpireMinutes"]!);
    private readonly double _refreshExpireDay = double.Parse(configuration["RefreshToken:ExpireDays"]!);
    
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
                Expires = DateTime.UtcNow.AddMinutes(_jwtExpireMin),
            });
            Response.Cookies.Append("refreshToken", response.refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, //TEMPORARY, LATER CHANGE TO HTTPS
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(_refreshExpireDay),
            });
            

            return Ok(new
            {
                response.id,
                response.username,
                response.isAdmin
            });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<ActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        Console.WriteLine("RefreshToken: "+refreshToken);

        if (!string.IsNullOrEmpty(refreshToken))
        {
            await service.Logout(refreshToken);
        }
        Response.Cookies.Delete("jwt");
        Response.Cookies.Delete("refreshToken");
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
            isAdmin = User.IsInRole("Admin")
        });
    }

    [HttpPost("auth/refresh")]
    [AllowAnonymous]
   public async Task<ActionResult> Refresh()
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized("Missing refresh token");
        
            var (token, refresh) = await service.RefreshToken(refreshToken);
        
            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, //TEMPORARY, LATER CHANGE TO HTTPS
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddMinutes(_jwtExpireMin),
            });
        
            Response.Cookies.Append("refreshToken", refresh,  new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(_refreshExpireDay)
            });
        
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    //TODO: MAKE SEPARATE METHOD FOR RETRIEVING BY USERNAME
    [HttpGet("getBoards")]
    [Authorize]
    public async Task<ActionResult> GetBoards()
    {
        try
        {
            var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var id = Guid.Parse(idStr!);
            
            var boards = await service.GetBoards(id, null);
            return Ok(boards);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
    [HttpGet("getBoardsAdmin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetBoardsAdmin(string username)
    {
        try
        {
            var boards = await service.GetBoards(null, username);
            return Ok(boards);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
    [HttpGet("getPayments")]
    [Authorize]
    public async Task<ActionResult> GetPayments()
    {
        try
        {
            var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var id = Guid.Parse(idStr!);
            
            var payments = await service.GetPayments(id, null);
            return Ok(payments);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
    [HttpGet("getPaymentsAdmin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetPaymentsAdmin(string username)
    {
        try
        {
            var payments = await service.GetPayments(null, username);
            return Ok(payments);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("getBalance")]
    [Authorize]
    public async Task<ActionResult> GetBalance()
    {
        try
        {
            var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var id = Guid.Parse(idStr!);

            int bal = await service.GetBalance(id);
            return Ok(bal);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPost("addBoard")]
    [Authorize]
    public async Task<ActionResult> AddBoard([FromBody] BoardReqDTO boardReqDto)
    {
        try
        {
            var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var id = Guid.Parse(idStr!);
            await service.AddBoard(boardReqDto, id);
            
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("addUser")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AddUser([FromBody] UserAddReqDTO userReqDto)
    {
        try
        {
            await service.AddUser(userReqDto);
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("getWeekIncome")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetGameIncome()
    {
        try
        {
            int income = await service.GetGameIncome();
            return Ok(income);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("addWinningNumbers")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AddWinningNumbers([FromBody] WinningNumsReqDTO winningNumsReqDto)
    {
        try
        {
            await service.AddWinningNumbers(winningNumsReqDto);
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("getWinners")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetWinners()
    {
        try
        {
            var res = await service.GetWinners();
            return Ok(res);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("getAllUsers")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetAllUsers()
    {
        try
        {
            var res = await service.GetAllUsers();
            return Ok(res);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("getUserInfo")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetUserInfo(string username)
    {
        try
        {
            var res = await service.GetUserInfo(username);
            return Ok(res);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("addPayment")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AddPayment([FromBody] PaymentReqDTO paymentReqDto)
    {
        try
        {
            await service.AddPayment(paymentReqDto);
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}