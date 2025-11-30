using Api.Services.Payments;
using Api.Services.Users;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;

public class PaymentStartup
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

        services.AddDbContext<PigeonsDbContext>(opts =>
            opts.UseNpgsql(_container.Container.GetConnectionString()));

        var userMock = Substitute.For<IUserService>();
        services.AddSingleton(userMock);

        services.AddScoped<IPaymentService, PaymentService>();
    }
}