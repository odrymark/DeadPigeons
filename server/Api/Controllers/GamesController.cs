using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.DTOs;

namespace Api.Controllers;

[ApiController]
[Route("api/games")]
public class GamesController(MainService service) : ControllerBase
{
    [HttpGet("getAllGames")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetAllGames()
    {
        var res = await service.GetAllGames();
        return Ok(res);
    }
    
    [HttpPost("addWinningNumbers")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AddWinningNumbers([FromBody] WinningNumsReqDTO winningNumsReqDto)
    {
        await service.AddWinningNumbers(winningNumsReqDto);
        return Ok();
    }
    
    [HttpGet("getGameIncome")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetGameIncome()
    {
        int income = await service.GetGameIncome();
        return Ok(income);
    }
}