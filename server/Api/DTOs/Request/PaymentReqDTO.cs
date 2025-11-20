namespace Api.DTOs;

public class PaymentReqDTO
{
    public string username { get; set; }
    public int amount { get; set; }
    public string paymentNumber { get; set; }
}