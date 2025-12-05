namespace Api.DTOs.Response;

public class UserLoginResDto
{
    public Guid id { get; set; }
    public string username { get; set; }
    public bool isAdmin { get; set; }
    public string token { get; set; }
    public string refreshToken { get; set; }
}