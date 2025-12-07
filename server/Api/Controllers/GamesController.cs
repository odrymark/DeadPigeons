using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.DTOs.Request;
using Api.Services.Games;

namespace Api.Controllers;

[ApiController]
[Route("api/games")]
public class GamesController(IGameManager manager, IGameService service) : ControllerBase
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
    public async Task<ActionResult> AddWinningNumbers([FromBody] WinningNumsReqDto winningNumsReqDto)
    {
        await manager.AddWinningNumbers(winningNumsReqDto);
        return Ok();
    }

    [HttpGet("getCurrGameClosing")]
    [Authorize]
    public async Task<ActionResult> GetCurrGameClosing()
    {
        var res = await service.GetCurrGameClosing();
        return Ok(res);
    }

    [HttpGet("getLastGameNums")]
    [Authorize]
    public async Task<ActionResult> GetLastGameNums()
    {
        var res = await service.GetLastGameNums();
        return Ok(res);
    }
}