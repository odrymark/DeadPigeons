namespace api.Services.Price;

public class PriceService : IPriceService
{
    private readonly Dictionary<int, int> _prices = new()
    {
        { 5, 20 },
        { 6, 40 },
        { 7, 80 },
        { 8, 160 }
    };

    public int GetPrice(int numberCount)
    {
        if (!_prices.TryGetValue(numberCount, out var price))
            throw new Exception("Invalid number count");

        return price;
    }
}