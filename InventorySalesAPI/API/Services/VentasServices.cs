using API.DTOs;
using API.Models;
using API.Repository;
using System.Text.Json;
using Amazon.SQS;
using Amazon.SQS.Model;

namespace API.Services
{
	public class VentasServices
	{
		private readonly VentasRep _repository;
		private readonly IConfiguration _configuration;
		private readonly IAmazonSQS _sqsClient;
		private readonly ILogger<VentasServices> _logger;

		public VentasServices(VentasRep repository, IConfiguration configuration, IAmazonSQS sqsClient, ILogger<VentasServices> logger)
		{
			_repository = repository;
			_configuration = configuration;
			_sqsClient = sqsClient;
			_logger = logger;
		}

		public async Task<List<VentaResponseDto>> GetAsync()
		{
			var ventas = await _repository.GetAllAsync();

			return ventas.Select(v => new VentaResponseDto
			{
				Id = v.Id,
				Date = v.Date,
				TotalAmount = v.TotalAmount,
				CustomerName = v.CustomerName,
				CustomerEmail = v.CustomerEmail,
				Productos = v.VentaProductos.Select(vp => new VentaProductoDto
				{
					ProductoId = vp.ProductoId,
					ProductoNombre = vp.Producto.Name,
					Cantidad = vp.Cantidad,
					PrecioUnitario = vp.PrecioUnitario
				}).ToList()
			}).ToList();
		}

		public async Task<VentaResponseDto?> GetOneAsync(int id)
		{
			var sale = await _repository.GetByIdAsync(id);

			return sale == null ? null : new VentaResponseDto
			{
				Id = sale.Id,
				Date = sale.Date,
				TotalAmount = sale.TotalAmount,
				CustomerName = sale.CustomerName,
				CustomerEmail = sale.CustomerEmail,
				Productos = sale.VentaProductos.Select(vp => new VentaProductoDto
				{
					ProductoId = vp.ProductoId,
					ProductoNombre = vp.Producto.Name,
					Cantidad = vp.Cantidad,
					PrecioUnitario = vp.PrecioUnitario
				}).ToList()
			};
		}

		public async Task<VentaResponseDto?> Create(CreateVentaDto dto)
		{
			await using var transaction = await _repository.InitTransactionAsync();

			try
			{
				var venta = new Venta
				{
					CustomerName = dto.CustomerName,
					CustomerEmail = dto.CustomerEmail,
					Date = DateTime.UtcNow
				};

				// Obtener todos los IDs solicitados
				var productIds = dto.Productos.Select(p => p.ProductoId).ToList();

				// Traer productos desde BD en una sola consulta
				var productosDb = await _repository.GetByIdsAsync(productIds);

				if (productosDb.Count != productIds.Count)
					throw new InvalidOperationException("Uno o más productos no existen.");

				var productosDict = productosDb.ToDictionary(p => p.Id);

				foreach (var item in dto.Productos)
				{
					var productoDb = productosDict[item.ProductoId];

					// Validar Stock
					if (productoDb.Stock < item.Cantidad)
						throw new InvalidOperationException(
							$"Stock insuficiente para el producto {productoDb.Name}"
						);

					var precioReal = productoDb.Price;

					venta.TotalAmount += item.Cantidad * precioReal;

					venta.VentaProductos.Add(new VentaProducto
					{
						ProductoId = productoDb.Id,
						Cantidad = item.Cantidad,
						PrecioUnitario = precioReal
					});

					// Descontar stock
					productoDb.Stock -= item.Cantidad;
				}

				var saved = await _repository.Create(venta);

				//  Confirmar transacción
				await transaction.CommitAsync();

				if (saved == null) return null;

				// Enviar notificación sin afectar la respuesta si falla
				try
				{
					await EnviarNotificacionVentaAsync(saved);
				}
				catch (Exception ex)
				{
					_logger.LogError(ex, "Error al enviar notificación de venta para VentaId: {VentaId}. Cliente: {CustomerName}", saved.Id, saved.CustomerName);
					// No relanzamos la excepción para no afectar el éxito de la venta
				}

				return new VentaResponseDto
				{
					Id = saved.Id,
					Date = saved.Date,
					TotalAmount = saved.TotalAmount,
					CustomerEmail = saved.CustomerEmail,
					CustomerName = saved.CustomerName,
					Productos = saved.VentaProductos.Select(vp => new VentaProductoDto
					{
						ProductoId = vp.ProductoId,
						ProductoNombre = productosDict[vp.ProductoId].Name,
						Cantidad = vp.Cantidad,
						PrecioUnitario = vp.PrecioUnitario
					}).ToList()
				};
			}	
			catch (InvalidOperationException ex)
			{
				_logger.LogWarning(ex, "Error de validación al crear venta: {Message}", ex.Message);
				await transaction.RollbackAsync();
				throw;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error inesperado al crear venta");
				await transaction.RollbackAsync();
				throw;
			}
		}

		// Ejemplo de envío a SQS en tu Service Layer
		public async Task EnviarNotificacionVentaAsync(Venta venta)
		{
			var queueUrl = _configuration["AWS:SQS:ColaVentas"] 
				?? throw new InvalidOperationException("La URL de la cola SQS no está configurada. Verifique appsettings.json o variables de entorno.");

			var mensaje = new
			{
				IdVenta = venta.Id,
				Cliente = venta.CustomerName,
				Monto = venta.TotalAmount,
				Email = venta.CustomerEmail ?? "davidariass0519@gmail.com",
				Detalle = venta.VentaProductos.Select(p => p.Producto.Name).ToList()
			};

			var request = new SendMessageRequest
			{
				QueueUrl = queueUrl,
				MessageBody = JsonSerializer.Serialize(mensaje)
			};

			try
			{
				await _sqsClient.SendMessageAsync(request);
			}
			catch (AmazonSQSException ex)
			{
				throw new InvalidOperationException($"Error al enviar mensaje a SQS: {ex.Message}", ex);
			}
		}
	}
}
