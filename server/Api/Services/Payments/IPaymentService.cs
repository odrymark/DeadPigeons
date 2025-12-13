using Api.DTOs.Request;
using Api.DTOs.Response;

namespace Api.Services.Payments;

public interface IPaymentService
{
    Task<IEnumerable<PaymentResDto>> GetPayments(Guid? id, Guid? userId);
    Task<int> GetBalance(Guid id);
    Task AddPayment(PaymentReqDto paymentReqDto, Guid id);
    Task ApprovePayment(PaymentReqDto paymentReqDto);
    Task CreateBuyPayment(int amount, Guid userId);
}