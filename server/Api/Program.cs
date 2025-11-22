using System.Text;
using Api.Services;
using DataAccess;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173")
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
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
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

builder.Services.AddSingleton<PasswordService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<MainService>();
builder.Services.AddControllers();
builder.Services.AddOpenApiDocument();

var app = builder.Build();

//TEMPORARY-------------------------------
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetService<PigeonsDbContext>()!.Database.EnsureCreated();
}

//TEMPORARY-------------------------------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PigeonsDbContext>();
    db.Database.EnsureCreated();

    var admin = db.Users.FirstOrDefault(u => u.username == "admin");

    if (admin == null)
    {
        var passwd = new PasswordService().HashPassword("password123");
        
        admin = new User
        {
            id = Guid.NewGuid(),
            username = "admin",
            password = passwd,
            email = "admin@gmail.com",
            phoneNumber = "+4512345678",
            isAdmin = true,
            isActive = true,
            createdAt = DateTime.UtcNow,
            lastLogin = DateTime.UtcNow
        };

        db.Users.Add(admin);
        db.SaveChanges();
    }
    
    var baseGame = db.Games.FirstOrDefault();

    if (baseGame == null)
    {
        baseGame = new Game
        {
            id = Guid.NewGuid(),
            numbers = new List<int>(),
            income = 0,
            createdAt = DateTime.UtcNow
        };

        db.Games.Add(baseGame);
        db.SaveChanges();
    }


    if (!db.Boards.Any(b => b.userId == admin.id))
    {
        db.Boards.Add(new Board
        {
            id = Guid.NewGuid(),
            userId = admin.id,
            gameId = baseGame.id,
            numbers = new List<int> { 1, 5, 12, 19, 23 },
            createdAt = DateTime.UtcNow,
            isWinner = false
        });

        db.SaveChanges();
    }

    if (!db.Payments.Any(p => p.userId == admin.id))
    {
        db.Payments.AddRange(
            new Payment
            {
                id = Guid.NewGuid(),
                userId = admin.id,
                amount = -50,
                paymentNumber = null,
                createdAt = DateTime.UtcNow
            },
            new Payment
            {
                id = Guid.NewGuid(),
                userId = admin.id,
                amount = 200,
                paymentNumber = "7439201586",
                createdAt = DateTime.UtcNow
            }
        );

        db.SaveChanges();
    }
}

app.UseOpenApi();
app.UseSwaggerUi();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();