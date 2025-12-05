using System.Security.Claims;
using Api.DTOs.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Services.Boards;

namespace Api.Controllers;

[ApiController]
[Route("api/boards")]
public class BoardsController(IBoardService service) : ControllerBase
{
    [HttpGet("getBoards")]
    [Authorize]
    public async Task<ActionResult> GetBoards()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var id = Guid.Parse(idStr!);
            
        var boards = await service.GetBoards(id, null);
        return Ok(boards);
    }
    
    [HttpGet("getBoardsAdmin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetBoardsAdmin(string username)
    {
        var boards = await service.GetBoards(null, username);
        return Ok(boards);
    }

    [HttpGet("getCurrBoardsForUser")]
    [Authorize]
    public async Task<ActionResult> GetCurrBoardsForUser()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var id = Guid.Parse(idStr!);
        var boards = await service.GetCurrGameUserBoards(id);
        return Ok(boards);
    }

    [HttpGet("getPrevBoardsForUser")]
    [Authorize]
    public async Task<ActionResult> GetPrevBoardsForUser()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var id = Guid.Parse(idStr!);
        var boards = await service.GetPrevGameUserBoards(id);
        return Ok(boards);
    }
    
    [HttpPost("addBoard")]
    [Authorize]
    public async Task<ActionResult> AddBoard([FromBody] BoardReqDto boardReqDto)
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var id = Guid.Parse(idStr!);
            
        await service.AddBoard(boardReqDto, id, null);
        return Ok();
    }
    
    [HttpPost("endRepeat")]
    [Authorize]
    public async Task<ActionResult> EndRepeat([FromBody] string id)
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userId = Guid.Parse(idStr!);

        var isAdmin = User.IsInRole("Admin");
        
        await service.EndRepeat(id, userId, isAdmin);
        return Ok();
    }
}