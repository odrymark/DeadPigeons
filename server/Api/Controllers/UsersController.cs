using Api.DTOs.Request;
using Api.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(IUserService service) : ControllerBase
{
    [HttpPost("addUser")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AddUser([FromBody] UserAddReqDto userReqDto)
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
    public async Task<ActionResult> GetUserInfo(string idStr)
    {
        var id = Guid.Parse(idStr);
        var res = await service.GetUserInfo(id);
        return Ok(res);
    }

    [HttpPost("editUser")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> EditUser([FromBody] UserEditReqDto userReqDto)
    {
        await service.EditUser(userReqDto);
        return Ok();
    }
}