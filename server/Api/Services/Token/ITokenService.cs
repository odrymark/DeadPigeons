using DataAccess;

namespace Api.Services;

public interface ITokenService
{
    string GenerateRefreshToken();
    string GenerateToken(User user);
    
}