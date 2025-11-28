using Api.DTOs;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(MainService service) : ControllerBase
{
    [HttpPost("addUser")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AddUser([FromBody] UserAddReqDTO userReqDto)
    {
        await service.AddUser(userReqDto);
        return Ok();
    }
    
    [HttpGet("getAllUsers")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetAllUsers()
    {
        var res = await service.GetAllUsers();
        return Ok(res);
    }
    
    [HttpGet("getUserInfo")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetUserInfo(string username)
    {
        var res = await service.GetUserInfo(username);
        return Ok(res);
    }
}