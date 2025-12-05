namespace Api.DTOs.Response;

public class UserInfoResDto
{
    public string username { get; set; }
    public string email { get; set; }
    public string phoneNumber { get; set; }
    public DateTime createdAt { get; set; }
    public DateTime lastLogin { get; set; }
    public bool isActive { get; set; }
}