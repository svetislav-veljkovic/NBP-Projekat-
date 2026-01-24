using backend.Services;
using backend.Services.IServices;
using backend.Repository;
using backend.Helpers;
using StackExchange.Redis;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// --- 1. INFRASTRUKTURA ---
// Povezivanje na Redis
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379"));

// Povezivanje na Cassandru
builder.Services.AddSingleton<CassandraService>();

// --- 2. REPOZITORIJUMI ---
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();

// --- 3. SERVISI ---
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<RedisService>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddHttpContextAccessor();

// --- 4. KONTROLERI I JSON ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // CamelCase je bitan jer React (i Recharts za dijagram) lakše čita "title" nego "Title"
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        // Dodajemo ovo da sprečimo probleme ako Cassandra vrati null vrednosti
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- 5. CORS (STRIKTNO ZA CREDENTIALS) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // URL tvog frontenda
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials(); // OBAVEZNO: Omogućava slanje JWT kolačića (Cookies)
        });
});

var app = builder.Build();

// --- 6. MIDDLEWARE REDOSLED ---
// Redosled je jako bitan za bezbednost i performanse
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

// CORS uvek ide pre Authentication/Authorization
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();