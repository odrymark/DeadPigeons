using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

public class BoardReqDTO : IValidatableObject
{
    [MinLength(5)]
    [MaxLength(8)]
    public List<int> numbers { get; set; } = new List<int>();

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if(numbers.Any(n => n < 1 || n > 16))
            yield return new ValidationResult("Numbers must be between 1 and 16",  new[] { nameof(numbers) });
        
        if(numbers.Count != numbers.Distinct().Count())
            yield return new ValidationResult("Numbers must not contain duplicates",  new[] { nameof(numbers) });
    }
}