using System.Security.Claims;
using Api.DTOs.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Services.Payments;

namespace Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController(IPaymentService service) : ControllerBase
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
    public async Task<ActionResult> GetPaymentsAdmin(string idStr)
    {
        var userId = Guid.Parse(idStr);
        var payments = await service.GetPayments(null, userId);
        return Ok(payments);
    }
    
    [HttpPost("addPayment")]
    [Authorize]
    public async Task<ActionResult> AddPayment([FromBody] PaymentReqDto paymentAddReqDto)
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var id = Guid.Parse(idStr!);
            
        await service.AddPayment(paymentAddReqDto, id);
        return Ok();
    }
    
    [HttpPost("approvePayment")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> ApprovePayment([FromBody] PaymentReqDto paymentReqDto)
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