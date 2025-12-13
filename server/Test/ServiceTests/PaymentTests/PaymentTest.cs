using Api.DTOs.Request;
using Api.Services.Payments;
using Api.Services.Users;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;
using Xunit.DependencyInjection;

namespace Test.ServiceTests.PaymentTests;

[Startup(typeof(PaymentStartup))]
public class PaymentTest : TestBase
{
    private readonly IPaymentService _service;
    private readonly IUserService _userService;

    public PaymentTest(PigeonsDbContext db, IPaymentService service, IUserService userService) : base(db)
    {
        _service = service;
        _userService = userService;
    }

    // -------------------------
    // GetPayments
    // -------------------------
    [Fact]
    public async Task GetPayments_ByUserId_Returns_Payments()
    {
        var user = await CreateUserAsync("bob");
        _userService.GetUserById(user.id).Returns(user);
        var payment = await CreatePaymentAsync(user.id, 100, true);

        var payments = await _service.GetPayments(null, user.id);

        Assert.Single(payments);
        Assert.Equal(100, payments.First().amount);
    }

    [Fact]
    public async Task GetPayments_Throws_When_UserNotFound()
    {
        var fakeUserId = Guid.NewGuid();
        _userService.GetUserById(fakeUserId).Returns<User>(_ => throw new Exception("User not found"));

        await Assert.ThrowsAsync<Exception>(() => _service.GetPayments(null, fakeUserId));
    }

    // -------------------------
    // CreateBuyPayment
    // -------------------------
    [Fact]
    public async Task CreateBuyPayment_Creates_NegativePayment()
    {
        var user = await CreateUserAsync();

        await _service.CreateBuyPayment(50, user.id);

        var payment = await Db.Payments.FirstAsync();
        Assert.Equal(-50, payment.amount);
        Assert.True(payment.isApproved);
    }

    // -------------------------
    // GetBalance
    // -------------------------
    [Fact]
    public async Task GetBalance_Returns_SumOfApprovedPayments()
    {
        var user = await CreateUserAsync();
        await CreatePaymentAsync(user.id, 50, true);
        await CreatePaymentAsync(user.id, 30, true);
        await CreatePaymentAsync(user.id, 20, false);

        var balance = await _service.GetBalance(user.id);

        Assert.Equal(80, balance); // Only approved payments count
    }

    // -------------------------
    // AddPayment
    // -------------------------
    [Fact]
    public async Task AddPayment_CreatesPayment()
    {
        var user = await CreateUserAsync("alice");
        _userService.GetUserById(user.id).Returns(user);

        var dto = new PaymentReqDto { paymentNumber = "12345" };

        await _service.AddPayment(dto, user.id);

        var payment = await Db.Payments.FirstAsync();
        Assert.Equal(user.id, payment.userId);
        Assert.Equal("12345", payment.paymentNumber);
    }

    [Fact]
    public async Task AddPayment_Throws_When_UserServiceFails()
    {
        var fakeUserId = Guid.NewGuid();
        _userService.GetUserById(fakeUserId).Returns<User>(_ => throw new Exception("User not found"));

        var dto = new PaymentReqDto { paymentNumber = "123" };

        await Assert.ThrowsAsync<Exception>(() => _service.AddPayment(dto, fakeUserId));
    }

    // -------------------------
    // ApprovePayment
    // -------------------------
    [Fact]
    public async Task ApprovePayment_SetsApprovedAndAmount()
    {
        var user = await CreateUserAsync("bob");
        var payment = await CreatePaymentAsync(user.id, null, false);

        var dto = new PaymentReqDto
        {
            id = payment.id.ToString(),
            isApproved = true,
            amount = 100
        };

        await _service.ApprovePayment(dto);

        var updated = await Db.Payments.FirstAsync();
        Assert.True(updated.isApproved);
        Assert.Equal(100, updated.amount);
    }

    [Fact]
    public async Task ApprovePayment_SetsDisapproved()
    {
        var user = await CreateUserAsync("bob");
        var payment = await CreatePaymentAsync(user.id, 100, true);

        var dto = new PaymentReqDto
        {
            id = payment.id.ToString(),
            isApproved = false
        };

        await _service.ApprovePayment(dto);

        var updated = await Db.Payments.FirstAsync();
        Assert.False(updated.isApproved);
        Assert.Null(updated.amount);
    }

    [Fact]
    public async Task ApprovePayment_Throws_When_InvalidId()
    {
        var dto = new PaymentReqDto { id = "not-a-guid", isApproved = true, amount = 10 };

        await Assert.ThrowsAsync<Exception>(() => _service.ApprovePayment(dto));
    }

    [Fact]
    public async Task ApprovePayment_Throws_When_PaymentNotFound()
    {
        var dto = new PaymentReqDto { id = Guid.NewGuid().ToString(), isApproved = true, amount = 10 };

        await Assert.ThrowsAsync<Exception>(() => _service.ApprovePayment(dto));
    }

    [Fact]
    public async Task ApprovePayment_Throws_When_AmountMissingOnApprove()
    {
        var user = await CreateUserAsync("bob");
        var payment = await CreatePaymentAsync(user.id);

        var dto = new PaymentReqDto { id = payment.id.ToString(), isApproved = true, amount = null };

        await Assert.ThrowsAsync<Exception>(() => _service.ApprovePayment(dto));
    }

    [Fact]
    public async Task ApprovePayment_Throws_When_isApprovedMissing()
    {
        var user = await CreateUserAsync("bob");
        var payment = await CreatePaymentAsync(user.id);

        var dto = new PaymentReqDto { id = payment.id.ToString() }; // isApproved not set

        await Assert.ThrowsAsync<Exception>(() => _service.ApprovePayment(dto));
    }
}