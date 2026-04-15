using API.Data;
using API.Repository;
using API.Services;
using Microsoft.EntityFrameworkCore;
using Amazon.SQS;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.SetBasePath(Directory.GetCurrentDirectory()).AddJsonFile("appsettings.json", optional: false, reloadOnChange: true).AddEnvironmentVariables();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var serverVersion = new MySqlServerVersion(new Version(8, 4, 7));

builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseMySql(connectionString, serverVersion)
);

builder.Services.AddProblemDetails();

// 1. Obtener las opciones de AWS desde appsettings
var awsOptions = builder.Configuration.GetAWSOptions();

// 2. Registrar el cliente de SQS
builder.Services.AddDefaultAWSOptions(awsOptions);
builder.Services.AddAWSService<IAmazonSQS>();

// Build Own Services
builder.Services.AddScoped<CategoryRep>();
builder.Services.AddScoped<CategoryServices>();

builder.Services.AddScoped<ProductRep>();
builder.Services.AddScoped<ProductService>();

builder.Services.AddScoped<VentasRep>();
builder.Services.AddScoped<VentasServices>();

builder.Services.AddScoped<ReportesRep>();
builder.Services.AddScoped<ReportServices>();

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

// app.UseHttpsRedirection();

//app.UseExceptionHandler("/error");

//app.Map("/error", (HttpContext context) =>
//{
//	return Results.Problem(
//		title: "An unexpected error occurred.",
//		statusCode: 500
//	);
//});

app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => Results.Ok("API running"));
app.MapGet("/health", () => Results.Ok("OK"));

using (var scope = app.Services.CreateScope())
{
	try
	{
		var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
		var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

		// Intentar con retries
		var maxRetries = 5;
		for (int i = 0; i < maxRetries; i++)
		{
			try
			{
				db.Database.Migrate();
				logger.LogInformation("Migraciones aplicadas exitosamente");
				break;
			}
			catch (Exception ex) when (i < maxRetries - 1)
			{
				logger.LogWarning(ex, $"Error migrando (intento {i + 1}/{maxRetries}), reintentando en 5 segundos...");
				await Task.Delay(5000);
			}
		}
	}
	catch (Exception ex)
	{
		Console.WriteLine("Error migrando la BD: " + ex.Message);
		// No lances la excepción, la app puede seguir intentando después
	}
}

app.Run();
