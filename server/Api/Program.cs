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

    var testUser = db.Users.FirstOrDefault(u => u.username == "testuser");

    if (testUser == null)
    {
        var passwd = new PasswordService().HashPassword("password123");
        
        testUser = new User
        {
            id = Guid.NewGuid(),
            username = "testuser",
            password = passwd,
            isAdmin = true,
            isActive = true,
            createdAt = DateTime.UtcNow,
            lastLogin = DateTime.UtcNow
        };

        db.Users.Add(testUser);
        db.SaveChanges();
    }

    if (!db.Boards.Any(b => b.userId == testUser.id))
    {
        db.Boards.Add(new Board
        {
            id = Guid.NewGuid(),
            userId = testUser.id,
            numbers = [1, 5, 12, 19, 23],
            createdAt = DateTime.UtcNow,
            isWinner = false
        });

        db.SaveChanges();
    }

    if (!db.Payments.Any(p => p.userId == testUser.id))
    {
        db.Payments.AddRange(
            new Payment
            {
                id = Guid.NewGuid(),
                userId = testUser.id,
                amount = -50,
                paymentNumber = null,
                createdAt = DateTime.UtcNow
            },
            new Payment
            {
                id = Guid.NewGuid(),
                userId = testUser.id,
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