using System.IdentityModel.Tokens.Jwt;
using Api.Services;
using Api.Services.Token;
using DataAccess;
using Microsoft.Extensions.Configuration;
using Xunit;
using Xunit.DependencyInjection;

namespace Test.ServiceTests.TokenTests;

[Startup(typeof(TokenStartup))]
public class TokenTest : TestBase
{
    private readonly TokenService _tokenService;
    private readonly PigeonsDbContext _db;
    private readonly IConfiguration _config;

    public TokenTest(TokenService tokenService, PigeonsDbContext db, IConfiguration config) : base(db)
    {
        _tokenService = tokenService;
        _db = db;
        _config = config;

        db.Database.EnsureCreated();
    }

    // --------------------------------------------------------
    // GenerateRefreshToken Tests
    // --------------------------------------------------------

    [Fact]
    public void GenerateRefreshToken_Returns_64Byte_Base64()
    {
        var token = _tokenService.GenerateRefreshToken();

        Assert.False(string.IsNullOrWhiteSpace(token));

        var raw = Convert.FromBase64String(token);
        Assert.Equal(64, raw.Length);
    }

    [Fact]
    public void GenerateRefreshToken_AlwaysUnique()
    {
        var t1 = _tokenService.GenerateRefreshToken();
        var t2 = _tokenService.GenerateRefreshToken();

        Assert.NotEqual(t1, t2);
    }

    // --------------------------------------------------------
    // GenerateToken Tests
    // --------------------------------------------------------

    [Fact]
    public async Task GenerateToken_Creates_Valid_JWT()
    {
        var user = await CreateUserAsync(isAdmin: true);

        var jwt = _tokenService.GenerateToken(user);

        Assert.False(string.IsNullOrWhiteSpace(jwt));

        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(jwt);

        Assert.Equal(user.username, token.Claims.First(c => c.Type == JwtRegisteredClaimNames.UniqueName).Value);
        Assert.Equal("Admin", token.Claims.First(c => c.Type == "role").Value);
        Assert.Equal(_config["JWT_ISSUER"], token.Issuer);
        Assert.Equal(_config["JWT_AUDIENCE"], token.Audiences.First());
    }

    [Fact]
    public async Task GenerateToken_Throws_When_KeyMissing()
    {
        var badConfig = new ConfigurationBuilder()
            .AddInMemoryCollection() // no JWT_KEY
            .Build();

        var service = new TokenService(badConfig);

        var user = await CreateUserAsync();

        Assert.Throws<ArgumentNullException>(() => service.GenerateToken(user));
    }

    [Fact]
    public async Task GenerateToken_Throws_When_ExpireMinutes_Invalid()
    {
        var badConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JWT_KEY"] = Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
                ["JWT_ISSUER"] = "issuer",
                ["JWT_AUDIENCE"] = "aud",
                ["JWT_EXPIREMINUTES"] = "not_a_number"
            })
            .Build();

        var service = new TokenService(badConfig);

        var user = await CreateUserAsync();

        Assert.Throws<FormatException>(() => service.GenerateToken(user));
    }
}