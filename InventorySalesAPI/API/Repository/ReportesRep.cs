using API.Data;
using API.DTOs;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
	public class ReportesRep : Repo
	{
		public async Task<List<SalesReportDto>> GetVentasPorDiaAsync()
		{
			var data = await _context.Ventas
				.GroupBy(v => v.Date.Date)
				.Select(g => new
				{
					Fecha = g.Key,
					Cantidad = g.Count(),
					Total = g.Sum(x => x.TotalAmount)
				})
				.OrderBy(x => x.Fecha)
				.ToListAsync();

			return data.Select(x => new SalesReportDto
			{
				fecha = x.Fecha.ToString("yyyy-MM-dd"),
				cantidad = x.Cantidad,
				total = x.Total
			}).ToList();
		}

		public ReportesRep(AppDbContext context) : base(context) { }

		public async Task<int> GetTotalVentasAsync()
		{
			return await _context.Ventas.CountAsync();
		}

		public async Task<decimal> GetTotalIngresosAsync()
		{
			return await _context.Ventas
				.SumAsync(v => (decimal?)v.TotalAmount) ?? 0;
		}

		public async Task<List<ProductSales>> GetProductosMasVendidosAsync(int top)
		{
			return await _context.VentaProductos
				.GroupBy(vp => new { vp.ProductoId, vp.Producto.Name })
				.Select(g => new ProductSales
				{
					produtoId = g.Key.ProductoId,
					nombre = g.Key.Name,
					cantidad = g.Sum(x => x.Cantidad),
					total = g.Sum(x => x.Cantidad * x.PrecioUnitario)
				})
				.OrderByDescending(x => x.cantidad)
				.Take(top)
				.ToListAsync();
		}

		public async Task<List<CategorySales>> GetVentasPorCategoriaAsync()
		{
			return await _context.VentaProductos
				.GroupBy(vp => new
				{
					vp.Producto.CategoriaId,
					vp.Producto.Categoria.Name
				})
				.Select(g => new CategorySales
				{
					categoriaId = g.Key.CategoriaId,
					categoria = g.Key.Name,
					cantidad = g.Sum(x => x.Cantidad),
					total = g.Sum(x => x.Cantidad * x.PrecioUnitario)
				})
				.OrderByDescending(x => x.cantidad)
				.ToListAsync();
		}

		public async Task<List<TopCategoriaDto>>
			GetCategoriasMasVendidasAsync(int top)
		{
			return await _context.VentaProductos
				.GroupBy(vp => new { vp.Producto.CategoriaId, vp.Producto.Categoria.Name })
				.Select(g => new
				{
					g.Key.Name,
					Cantidad = g.Sum(x => x.Cantidad)
				})
				.OrderByDescending(x => x.Cantidad)
				.Take(top)
				.Select(x => 
					new TopCategoriaDto() 
					{ 
						Nombre = x.Name, 
						Cantidad = x.Cantidad 
					}
				)
				.ToListAsync();
		}
	}
}
