using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

public class PaymentReqDTO
{
    public string? id { get; set; }
    public int? amount { get; set; }
    [Required]
    [RegularExpression("^[0-9]{10}$", ErrorMessage = "Payment number must be exactly 10 digits and contain only numbers.")]
    public string paymentNumber { get; set; }
    public bool? isApproved { get; set; }
}