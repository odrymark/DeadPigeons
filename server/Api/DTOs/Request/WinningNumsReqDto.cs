using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.Request;

public class WinningNumsReqDto : IValidatableObject
{
    [Required(ErrorMessage = "Winning numbers are required")]
    [MinLength(3, ErrorMessage = "You must provide exactly 3 numbers.")]
    [MaxLength(3, ErrorMessage = "You must provide exactly 3 numbers.")]
    public List<int> numbers { get; set; } = new List<int>();
    
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if(numbers.Any(n => n < 1 || n > 16))
            yield return new ValidationResult("Numbers must be between 1 and 16",  new[] { nameof(numbers) });
        
        if(numbers.Count != numbers.Distinct().Count())
            yield return new ValidationResult("Numbers must not contain duplicates",  new[] { nameof(numbers) });
    }
}