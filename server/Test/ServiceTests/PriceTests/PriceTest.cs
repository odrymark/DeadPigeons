using api.Services.Price;
using DataAccess;
using Xunit;
using Xunit.DependencyInjection;

namespace Test.ServiceTests.PriceTests;

[Startup(typeof(PriceStartup))]
public class PriceTest
{
    private readonly IPriceService _priceService;
    private readonly PigeonsDbContext _db;

    public PriceTest(IPriceService priceService, PigeonsDbContext db)
    {
        _priceService = priceService;
        _db = db;

        db.Database.EnsureCreated();
    }

    // -----------------------
    // Happy Path Tests
    // -----------------------

    [Theory]
    [InlineData(5, 20)]
    [InlineData(6, 40)]
    [InlineData(7, 80)]
    [InlineData(8, 160)]
    public void GetPrice_ReturnsCorrectPrice(int count, int expectedPrice)
    {
        var price = _priceService.GetPrice(count);

        Assert.Equal(expectedPrice, price);
    }

    // -----------------------
    // Unhappy Path Tests
    // -----------------------

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(9)]
    [InlineData(-5)]
    public void GetPrice_Throws_ForInvalidCount(int invalidCount)
    {
        Assert.Throws<Exception>(() => _priceService.GetPrice(invalidCount));
    }
}