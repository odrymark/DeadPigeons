using DataAccess;

namespace Api.Services.Token;

public interface ITokenService
{
    string GenerateRefreshToken();
    string GenerateToken(User user);
    
}