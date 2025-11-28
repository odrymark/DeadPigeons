using System.Security.Claims;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.DTOs;

namespace Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController(MainService service) : ControllerBase
{
    [HttpGet("getPayments")]
    [Authorize]
    public async Task<ActionResult> GetPayments()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var id = Guid.Parse(idStr!);
            
        var payments = await service.GetPayments(id, null);
        return Ok(payments);
    }
    
    [HttpGet("getPaymentsAdmin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetPaymentsAdmin(string username)
    {
        var payments = await service.GetPayments(null, username);
        return Ok(payments);
    }
    
    [HttpPost("addPayment")]
    [Authorize]
    public async Task<ActionResult> AddPayment([FromBody] PaymentReqDTO paymentAddReqDto)
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var id = Guid.Parse(idStr!);
            
        await service.AddPayment(paymentAddReqDto, id);
        return Ok();
    }
    
    [HttpPost("approvePayment")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> ApprovePayment([FromBody] PaymentReqDTO paymentReqDto)
    {
        await service.ApprovePayment(paymentReqDto);
        return Ok();
    }
    
    [HttpGet("getBalance")]
    [Authorize]
    public async Task<ActionResult> GetBalance()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var id = Guid.Parse(idStr!);

        int bal = await service.GetBalance(id);
        return Ok(bal);
    }
}