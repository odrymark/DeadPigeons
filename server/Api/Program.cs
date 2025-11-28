using System.Text;
using api;
using Api.Services;
using api.Settings;
using DataAccess;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("Auth"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("https://pigeons-web.fly.dev")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
        );
});

builder.Services.AddDbContext<PigeonsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication("JwtAuth")
    .AddJwtBearer("JwtAuth", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JWT_ISSUER"],
            ValidAudience = builder.Configuration["JWT_AUDIENCE"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JWT_KEY"]!))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Cookies["jwt"];
                if (!string.IsNullOrEmpty(token))
                    context.Token = token;

                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context => 
            {
                Console.WriteLine($"Authentication Failed: {context.Exception.Message}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("Auth"));

builder.Services.AddSingleton<PasswordService>();
builder.Services.AddScoped<ISeeder, Seeder>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<MainService>();
builder.Services.AddControllers();
builder.Services.AddOpenApiDocument();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<ISeeder>();
    await seeder.Seed();
}

app.UseOpenApi();
app.UseSwaggerUi();
app.UseExceptionHandler("/error");
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();