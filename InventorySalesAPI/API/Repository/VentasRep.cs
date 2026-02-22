using API.Data;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
	public class VentasRep : Repo
	{
		public VentasRep(AppDbContext context) : base(context) { }

		public async Task<List<Venta>> GetAllAsync()
		{
			return await _context.Ventas
				.Include(v => v.VentaProductos)
				.ThenInclude(vp => vp.Producto)
				.ToListAsync();
		}

		public async Task<Venta?> GetByIdAsync(int id)
		{
			return await _context.Ventas
				.Include(v => v.VentaProductos)
				.ThenInclude(vp => vp.Producto)
				.FirstOrDefaultAsync(v => v.Id == id);
		}

		public async Task<Venta?> Create(Venta venta, List<VentaProducto> productos)
		{
			// Asociar productos a la venta
			foreach (var vp in productos)
			{
				venta.VentaProductos.Add(new VentaProducto
				{
					ProductoId = vp.ProductoId,
					Cantidad = vp.Cantidad,
					PrecioUnitario = vp.PrecioUnitario
				});
			}

			await _context.Ventas.AddAsync(venta);
			await _context.SaveChangesAsync();

			return await GetByIdAsync(venta.Id);
		}
	}
}
