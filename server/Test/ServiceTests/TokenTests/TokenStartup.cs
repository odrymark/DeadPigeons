using Api.Services;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

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

        // Provide configuration for JWT
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JWT_KEY"] = Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
                ["JWT_ISSUER"] = "test_issuer",
                ["JWT_AUDIENCE"] = "test_audience",
                ["JWT_EXPIREMINUTES"] = "15"
            })
            .Build();

        services.AddSingleton<IConfiguration>(config);

        services.AddSingleton<TokenService>();
    }
}