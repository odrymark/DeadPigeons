using Api.Services;
using Api.Services.Password;
using Xunit;
using Xunit.DependencyInjection;

namespace Test.ServiceTests.PasswordTests;

[Startup(typeof(PasswordStartup))]
public class PasswordTest
{
    private readonly IPasswordService _service;

    public PasswordTest(IPasswordService service)
    {
        _service = service;
    }

    // ----------------------------------------------------------
    // HashPassword Tests
    // ----------------------------------------------------------

    [Fact]
    public void HashPassword_Returns_NonNull_AndDifferentEachTime()
    {
        var hash1 = _service.HashPassword("mypassword");
        var hash2 = _service.HashPassword("mypassword");

        Assert.False(string.IsNullOrWhiteSpace(hash1));
        Assert.False(string.IsNullOrWhiteSpace(hash2));

        Assert.NotEqual(hash1, hash2);
    }

    // ----------------------------------------------------------
    // VerifyHashedPassword Tests
    // ----------------------------------------------------------

    [Fact]
    public void VerifyHashedPassword_Returns_True_For_CorrectPassword()
    {
        var hash = _service.HashPassword("super-secret");

        var valid = _service.VerifyHashedPassword(hash, "super-secret");

        Assert.True(valid);
    }

    [Fact]
    public void VerifyHashedPassword_Returns_False_For_WrongPassword()
    {
        var hash = _service.HashPassword("correct-password");

        var valid = _service.VerifyHashedPassword(hash, "wrong-password");

        Assert.False(valid);
    }

    [Fact]
    public void VerifyHashedPassword_Returns_False_For_InvalidHash()
    {
        var valid = _service.VerifyHashedPassword("THIS_IS_NOT_A_HASH", "pw");

        Assert.False(valid);
    }

    // ----------------------------------------------------------
    // HashRefreshToken Tests (SHA256)
    // ----------------------------------------------------------

    [Fact]
    public void HashRefreshToken_Returns_SHA256_HexString()
    {
        var hash = _service.HashRefreshToken("abcd1234");

        Assert.False(string.IsNullOrWhiteSpace(hash));
        Assert.Equal(64, hash.Length);
    }

    [Fact]
    public void HashRefreshToken_Changes_When_TokenChanges()
    {
        var h1 = _service.HashRefreshToken("token1");
        var h2 = _service.HashRefreshToken("token2");

        Assert.NotEqual(h1, h2);
    }

    [Fact]
    public void HashRefreshToken_Is_Deterministic()
    {
        var h1 = _service.HashRefreshToken("same");
        var h2 = _service.HashRefreshToken("same");

        Assert.Equal(h1, h2);
    }
}