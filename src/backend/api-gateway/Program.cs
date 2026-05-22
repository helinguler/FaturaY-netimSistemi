// frontendin doğrudan her mikroservise gitmesi yerine
// requestleri önce bu gateway’e gönderiyor
// gateway de istekleri ilgili backend servisine yönlendiriyor

var builder = WebApplication.CreateBuilder(args);

//  frontendin API Gatewaye istek atmasına izin verir
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// gatewaye gelen requesti alır
// appsettings.json içindeki ReverseProxy ayarlarına göre ilgili servise yönlendirir
builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.UseCors("AllowFrontend");

app.MapGet("/", () => Results.Ok(new
{
    Service = "Invoice Management API Gateway",
    Status = "Running",
    Routes = new[]
    {
        "/api/auth",
        "/api/customers",
        "/api/invoices"
    }
}));

app.MapReverseProxy();  // appsettings.json içindeki YARP route ayarlarını aktif eder

app.Run();
