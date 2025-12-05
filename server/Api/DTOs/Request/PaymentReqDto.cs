using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.Request.Request;

public class PaymentReqDto
{
    [RegularExpression(@"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", ErrorMessage = "Invalid GUID format.")]
    public string? id { get; set; }
    
    [Range(1, int.MaxValue, ErrorMessage = "Amount must be a positive integer.")]
    public int? amount { get; set; }
    
    [Required]
    [RegularExpression("^[0-9]{10}$", ErrorMessage = "Payment number must be exactly 10 digits and contain only numbers.")]
    public string paymentNumber { get; set; }
    
    public bool? isApproved { get; set; }
}