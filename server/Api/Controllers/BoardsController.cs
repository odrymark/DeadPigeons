using System.Security.Claims;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.DTOs;

namespace Api.Controllers;

[ApiController]
[Route("api/boards")]
public class BoardsController(MainService service) : ControllerBase
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
    
    [HttpPost("addBoard")]
    [Authorize]
    public async Task<ActionResult> AddBoard([FromBody] BoardReqDTO boardReqDto)
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
        
        await service.EndRepeat(id, userId);
        return Ok();
    }
}