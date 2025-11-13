using Api.DTOs;
using Api.DTOs.Response;
using Api.Services;
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
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

}