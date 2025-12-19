using Api.DTOs.Request;
using Api.Services;
using Api.Services.Password;
using Api.Services.Users;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Xunit.DependencyInjection;

namespace Test.ServiceTests.UserTests;

[Startup(typeof(UserStartup))]
public class UserTest : TestBase
{
    private readonly IUserService _service;
    private readonly IPasswordService _passwordService;

    public UserTest(PigeonsDbContext db, IUserService service, IPasswordService passwordService) : base(db)
    {
        _service = service;
        _passwordService = passwordService;
    }

    // -------------------------
    // GetUserById Tests
    // -------------------------
    [Fact]
    public async Task GetUserById_Returns_User_When_Found()
    {
        var user = await CreateUserAsync("alice");

        var result = await _service.GetUserById(user.id);

        Assert.Equal("alice", result.username);
    }

    [Fact]
    public async Task GetUserById_Throws_When_NotFound()
    {
        await Assert.ThrowsAsync<Exception>(() => _service.GetUserById(Guid.NewGuid()));
    }

    // -------------------------
    // GetAllUsers Tests
    // -------------------------
    [Fact]
    public async Task GetAllUsers_Returns_Usernames()
    {
        var user1 = await CreateUserAsync("bob");
        var user2 = await CreateUserAsync("carol");

        var result = await _service.GetAllUsers();

        var usernames = result.Select(u => u.username).ToList();
        Assert.Contains("bob", usernames);
        Assert.Contains("carol", usernames);
    }

    [Fact]
    public async Task GetAllUsers_Returns_Empty_When_NoUsers()
    {
        var result = await _service.GetAllUsers();

        Assert.Empty(result);
    }

    // -------------------------
    // GetUserInfo Tests
    // -------------------------
    [Fact]
    public async Task GetUserInfo_Returns_UserInfo_When_Found()
    {
        var user = await CreateUserAsync("dave");

        var result = await _service.GetUserInfo(user.id);

        Assert.Equal("dave", result.username);
        Assert.Equal("dave@example.com", result.email);
        Assert.Equal("1234567890", result.phoneNumber);
        Assert.True(result.isActive);
    }

    [Fact]
    public async Task GetUserInfo_Throws_When_NotFound()
    {
        await Assert.ThrowsAsync<Exception>(() => _service.GetUserInfo(Guid.NewGuid()));
    }

    // -------------------------
    // AddUser Tests
    // -------------------------
    [Fact]
    public async Task AddUser_Creates_New_User()
    {
        var dto = new UserAddReqDto
        {
            username = "eve",
            password = "password",
            email = "eve@test.com",
            phoneNumber = "5555555555"
        };

        await _service.AddUser(dto);

        var user = await Db.Users.FirstAsync(u => u.username == "eve");

        Assert.Equal("eve", user.username);
        Assert.Equal("HASH_password", user.password);
        Assert.Equal("eve@test.com", user.email);
        Assert.Equal("5555555555", user.phoneNumber);
        Assert.False(user.isAdmin);
        Assert.False(user.isActive);
    }

    [Fact]
    public async Task AddUser_Throws_When_Duplicate_Username()
    {
        await CreateUserAsync("frank");

        var dto = new UserAddReqDto
        {
            username = "frank",
            password = "pw",
            email = "new@test.com",
            phoneNumber = "222"
        };

        await Assert.ThrowsAsync<Exception>(() => _service.AddUser(dto));
    }

    [Fact]
    public async Task AddUser_Throws_When_Duplicate_Email()
    {
        await CreateUserAsync("gwen");

        var dto = new UserAddReqDto
        {
            username = "newuser",
            password = "pw",
            email = "gwen@example.com",
            phoneNumber = "222"
        };

        await Assert.ThrowsAsync<Exception>(() => _service.AddUser(dto));
    }

    [Fact]
    public async Task AddUser_Throws_When_Duplicate_PhoneNumber()
    {
        await CreateUserAsync("harry");

        var dto = new UserAddReqDto
        {
            username = "newuser",
            password = "pw",
            email = "new@test.com",
            phoneNumber = "1234567890"
        };

        await Assert.ThrowsAsync<Exception>(() => _service.AddUser(dto));
    }
    
    // -------------------------
    // EditUser Tests
    // -------------------------
    [Fact]
    public async Task EditUser_Updates_User_When_Found()
    {
        var originalUser = await CreateUserAsync("jason");
        var editDto = new UserEditReqDto
        {
            id = originalUser.id.ToString(),
            username = "jason_updated",
            email = "jason.updated@example.com",
            phoneNumber = "9999999999",
            password = "newStrongPassword123",
            isActive = true
        };

        await _service.EditUser(editDto);

        var updatedUser = await Db.Users.FirstAsync(u => u.id == originalUser.id);

        Assert.Equal("jason_updated", updatedUser.username);
        Assert.Equal("jason.updated@example.com", updatedUser.email);
        Assert.Equal("9999999999", updatedUser.phoneNumber);
        Assert.True(updatedUser.isActive);
        Assert.Equal("HASH_newStrongPassword123", updatedUser.password);
    }

    [Fact]
    public async Task EditUser_Throws_When_User_Not_Found()
    {
        var editDto = new UserEditReqDto
        {
            id = Guid.NewGuid().ToString(),
            username = "nonexistent",
            email = "nope@example.com",
            phoneNumber = "0000000000",
            password = "irrelevant",
            isActive = false
        };

        await Assert.ThrowsAsync<Exception>(() => _service.EditUser(editDto));
    }
}