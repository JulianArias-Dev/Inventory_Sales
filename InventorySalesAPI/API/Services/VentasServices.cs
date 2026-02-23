using API.DTOs;
using API.Models;
using API.Repository;

namespace API.Services
{
	public class VentasServices
	{
		private readonly VentasRep _repository;

		public VentasServices(VentasRep repository)
		{
			_repository = repository;
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
			var venta = new Venta
			{
				CustomerName = dto.CustomerName,
				Date = DateTime.UtcNow
			};

			// Obtener todos los IDs solicitados
			var productIds = dto.Productos.Select(p => p.ProductoId).ToList();

			// Traer productos desde BD en una sola consulta
			var productosDb = await _repository.GetByIdsAsync(productIds);

			if (productosDb.Count != productIds.Count)
				throw new InvalidOperationException("Uno o más productos no existen.");

			foreach (var item in dto.Productos)
			{
				var productoDb = productosDb.First(p => p.Id == item.ProductoId);

				var precioReal = productoDb.Price;

				venta.TotalAmount += item.Cantidad * precioReal;

				venta.VentaProductos.Add(new VentaProducto
				{
					ProductoId = productoDb.Id,
					Cantidad = item.Cantidad,
					PrecioUnitario = precioReal
				});
			}

			var saved = await _repository.Create(venta);

			if (saved == null)
				return null;

			return new VentaResponseDto
			{
				Id = saved.Id,
				Date = saved.Date,
				TotalAmount = saved.TotalAmount,
				CustomerName = saved.CustomerName,
				Productos = saved.VentaProductos.Select(vp => new VentaProductoDto
				{
					ProductoId = vp.ProductoId,
					ProductoNombre = productosDb.First(p => p.Id == vp.ProductoId).Name,
					Cantidad = vp.Cantidad,
					PrecioUnitario = vp.PrecioUnitario
				}).ToList()
			};
		}
	}
}
