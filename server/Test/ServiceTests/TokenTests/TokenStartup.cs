using Api.Services;
using Api.Services.Token;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Test.ServiceTests.TokenTests;

public class TokenStartup
{
    private static DbContainer? _container;

    public void ConfigureServices(IServiceCollection services)
    {
        if (_container == null)
        {
            _container = new DbContainer();
            _container.InitializeAsync().GetAwaiter().GetResult();
        }

        services.AddSingleton(_container);

        services.AddDbContext<PigeonsDbContext>(options =>
            options.UseNpgsql(_container.Container.GetConnectionString()));

        var key = new byte[64];
        new Random().NextBytes(key);
        var jwtKey = Convert.ToBase64String(key);
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JWT_KEY"] = jwtKey,
                ["JWT_ISSUER"] = "test_issuer",
                ["JWT_AUDIENCE"] = "test_audience",
                ["JWT_EXPIREMINUTES"] = "15"
            })
            .Build();

        services.AddSingleton<IConfiguration>(config);

        services.AddSingleton<TokenService>();
    }
}