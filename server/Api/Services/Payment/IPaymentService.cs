using Api.DTOs;
using Api.DTOs.Response;

namespace Api.Services.Payments;

public interface IPaymentService
{
    Task<IEnumerable<PaymentResDTO>> GetPayments(Guid? id, string? username);
    Task<int> GetBalance(Guid id);
    Task AddPayment(PaymentReqDTO paymentReqDto, string username);
    Task ApprovePayment(PaymentReqDTO paymentReqDto);
    Task CreateBuyPayment(int amount, Guid userId);
}