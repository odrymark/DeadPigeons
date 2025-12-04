namespace Api.DTOs;

public class UserAddReqDTO
{
    //TODO: VALIDATION FOR ALL DTOs
    public string username { get; set; }
    public string password { get; set; }
    public string email { get; set; }
    public string phoneNumber { get; set; }
}