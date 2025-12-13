namespace Api.DTOs.Response;

public class GetMeResDto
{
    public Guid id { get; set; }
    public string username { get; set; }
    public bool isAdmin { get; set; }
}