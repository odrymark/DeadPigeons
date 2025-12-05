using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.Request.Request;

public class BoardReqDto : IValidatableObject
{
    [MinLength(5, ErrorMessage = "You must provide at least 5 numbers.")]
    [MaxLength(8, ErrorMessage = "You must provide maximum 8 numbers.")]
    public List<int> numbers { get; set; } = new List<int>();
    public int repeats { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if(numbers.Any(n => n < 1 || n > 16))
            yield return new ValidationResult("Numbers must be between 1 and 16",  new[] { nameof(numbers) });
        
        if(numbers.Count != numbers.Distinct().Count())
            yield return new ValidationResult("Numbers must not contain duplicates",  new[] { nameof(numbers) });
    }
}