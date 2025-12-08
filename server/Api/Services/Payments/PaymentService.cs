using Api.DTOs.Request;
using Api.DTOs.Response;
using Api.Services.Users;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Api.Services.Payments;

public class PaymentService(PigeonsDbContext context, IUserService userService) : IPaymentService
{
    public async Task<IEnumerable<PaymentResDto>> GetPayments(Guid? id, Guid? userId)
    {
        if (id != null)
        {
            return await context.Payments
                .Where(p => p.userId == id.Value)
                .Select(p => new PaymentResDto
                {
                    id = p.id,
                    createdAt = p.createdAt,
                    amount = p.amount,
                    paymentNumber = p.paymentNumber,
                    isApproved = p.isApproved
                })
                .ToListAsync();
        }
    
        if (userId != null)
        {
            var user = await userService.GetUserById(userId.Value);
        
            return await context.Payments
                .Where(p => p.userId == user.id)
                .Select(p => new PaymentResDto
                {
                    id = p.id,
                    createdAt = p.createdAt,
                    amount = p.amount,
                    paymentNumber = p.paymentNumber,
                    isApproved = p.isApproved
                    
                })
                .ToListAsync();
        }
    
        throw new Exception("No user data given");
    }
    
    public async Task CreateBuyPayment(int amount, Guid userId)
    {
        var payment = new Payment
        {
            id = Guid.NewGuid(),
            userId = userId,
            amount = -amount,
            createdAt = DateTime.UtcNow,
            paymentNumber = null,
            isApproved = true
        };

        context.Payments.Add(payment);
        await context.SaveChangesAsync();
    }
    
    public async Task<int> GetBalance(Guid id)
    {
        return await context.Payments
            .Where(p => p.userId == id && p.amount != null && p.isApproved == true)
            .SumAsync(p => p.amount) ?? 0;
    }
    
    public async Task AddPayment(PaymentReqDto paymentReqDto, Guid id)
    {
        try
        {
            var user = await userService.GetUserById(id);

            var payment = new Payment
            {
                userId = user.id,
                paymentNumber = paymentReqDto.paymentNumber,
                createdAt = DateTime.UtcNow
            };
            
            context.Payments.Add(payment);
            await context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            throw new Exception(e.Message);
        }
    }

    public async Task ApprovePayment(PaymentReqDto paymentReqDto)
    {
        if (!Guid.TryParse(paymentReqDto.id, out var paymentGuid))
            throw new Exception("Invalid payment ID format");

        var payment = await context.Payments
            .Include(p => p.user)
            .FirstOrDefaultAsync(p => p.id == paymentGuid);

        if (payment == null)
            throw new Exception("Payment not found for this user");

        if (!paymentReqDto.isApproved.HasValue)
            throw new Exception("isApproved must be set");

        if (paymentReqDto.isApproved.Value)
        {
            if (paymentReqDto.amount == null)
                throw new Exception("Amount is required for approving");

            payment.isApproved = true;
            payment.amount = paymentReqDto.amount.Value;
        }
        else
        {
            payment.isApproved = false;
            payment.amount = null;
        }

        await context.SaveChangesAsync();
    }
}