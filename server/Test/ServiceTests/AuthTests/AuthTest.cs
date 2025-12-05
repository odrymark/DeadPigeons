using Api.DTOs.Request;
using Api.Services;
using Api.Services.Auth;
using Api.Services.Password;
using Api.Services.Token;
using DataAccess;
using NSubstitute;
using Xunit;
using Xunit.DependencyInjection;

namespace Test.ServiceTests.AuthTests;

[Startup(typeof(AuthStartup))]
public class AuthServiceTests : TestBase
{
    private readonly IAuthService _authService;
    private readonly IPasswordService _passwordService;
    private readonly ITokenService _tokenService;

    public AuthServiceTests(PigeonsDbContext db, IAuthService authService,
        IPasswordService passwordService, ITokenService tokenService)
        : base(db)
    {
        _authService = authService;
        _passwordService = passwordService;
        _tokenService = tokenService;
    }

    // -------------------------
    // AuthenticateUser Tests
    // -------------------------

    [Fact]
    public async Task AuthenticateUser_Returns_Token_When_Valid()
    {
        string username = "test_auth_valid_" + Guid.NewGuid().ToString("N");
        var user = await CreateUserAsync(username, password: "hashed_pw");

        _passwordService.VerifyHashedPassword("hashed_pw", "password").Returns(true);
        _tokenService.GenerateToken(user).Returns("jwt_token");
        _tokenService.GenerateRefreshToken().Returns("refresh_token_new");
        _passwordService.HashRefreshToken("refresh_token_new").Returns("HASH_refresh_token_new");

        var req = new UserLoginReqDto
        {
            username = username,
            password = "password"
        };

        var res = await _authService.AuthenticateUser(req);

        Assert.Equal(user.username, res.username);
        Assert.Equal("jwt_token", res.token);
        Assert.Equal("refresh_token_new", res.refreshToken);
    }

    [Fact]
    public async Task AuthenticateUser_Throws_When_User_Not_Found()
    {
        string ghostUsername = "ghost_" + Guid.NewGuid().ToString("N");
        await Assert.ThrowsAsync<Exception>(async () =>
        {
            await _authService.AuthenticateUser(new UserLoginReqDto
            {
                username = ghostUsername,
                password = "password"
            });
        });
    }

    [Fact]
    public async Task AuthenticateUser_Throws_When_Password_Invalid()
    {
        string username = "test_auth_invalid_pw_" + Guid.NewGuid().ToString("N");
        var user = await CreateUserAsync(username, password: "pw_hash");

        _passwordService.VerifyHashedPassword(Arg.Any<string>(), Arg.Any<string>()).Returns(false);

        await Assert.ThrowsAsync<Exception>(async () =>
        {
            await _authService.AuthenticateUser(new UserLoginReqDto
            {
                username = username,
                password = "incorrect"
            });
        });
    }

    // -------------------------
    // RefreshToken Tests
    // -------------------------

    [Fact]
    public async Task RefreshToken_Returns_NewTokens_When_Valid()
    {
        string username = "test_refresh_valid_" + Guid.NewGuid().ToString("N");
        string plainRefresh = "refresh_valid_" + Guid.NewGuid().ToString("N");
        var user = await CreateUserAsync(username, password: "hashed_pw");
        user.refreshToken = "HASH_" + plainRefresh;
        user.refreshTokenExpiry = DateTime.UtcNow.AddDays(1);
        await Db.SaveChangesAsync();

        _passwordService.VerifyHashedPassword("HASH_" + plainRefresh, plainRefresh).Returns(true);
        _tokenService.GenerateToken(user).Returns("jwt_token");
        _tokenService.GenerateRefreshToken().Returns("refresh_token_new");
        _passwordService.HashRefreshToken("refresh_token_new").Returns("HASH_refresh_token_new");

        var (token, refresh) = await _authService.RefreshToken(plainRefresh);

        Assert.Equal("jwt_token", token);
        Assert.Equal("refresh_token_new", refresh);
    }

    [Fact]
    public async Task RefreshToken_Throws_When_Invalid()
    {
        string invalidRefresh = "not_in_db_" + Guid.NewGuid().ToString("N");
        await Assert.ThrowsAsync<Exception>(() =>
            _authService.RefreshToken(invalidRefresh));
    }

    [Fact]
    public async Task RefreshToken_Throws_When_Expired()
    {
        string username = "test_refresh_expired_" + Guid.NewGuid().ToString("N");
        string plainRefresh = "refresh_expired_" + Guid.NewGuid().ToString("N");
        var user = await CreateUserAsync(username, password: "hashed_pw");
        user.refreshToken = "HASH_" + plainRefresh;
        user.refreshTokenExpiry = DateTime.UtcNow.AddDays(-1);
        await Db.SaveChangesAsync();

        await Assert.ThrowsAsync<Exception>(() =>
            _authService.RefreshToken(plainRefresh));
    }

    // -------------------------
    // Logout Tests
    // -------------------------

    [Fact]
    public async Task Logout_Removes_RefreshToken_When_Valid()
    {
        string username = "test_logout_" + Guid.NewGuid().ToString("N");
        string plainRefresh = "refresh_logout_" + Guid.NewGuid().ToString("N");
        var user = await CreateUserAsync(username, password: "hashed_pw");
        user.refreshToken = "HASH_" + plainRefresh;
        user.refreshTokenExpiry = DateTime.UtcNow.AddDays(5);
        await Db.SaveChangesAsync();

        _passwordService.VerifyHashedPassword("HASH_" + plainRefresh, plainRefresh).Returns(true);

        await _authService.Logout(plainRefresh);

        await Db.Entry(user).ReloadAsync();

        Assert.Null(user.refreshToken);
        Assert.Null(user.refreshTokenExpiry);
    }

    [Fact]
    public async Task Logout_Throws_When_User_Not_Found()
    {
        string invalidRefresh = "invalid_" + Guid.NewGuid().ToString("N");
        await Assert.ThrowsAsync<Exception>(() =>
            _authService.Logout(invalidRefresh));
    }
}