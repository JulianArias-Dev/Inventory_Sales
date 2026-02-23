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

		public async Task<Venta?> Create(Venta venta)
		{
			await _context.Ventas.AddAsync(venta);
			await _context.SaveChangesAsync();

			return venta; 
		}

		public async Task<List<Producto>> GetByIdsAsync(List<int> ids)
		{
			return await _context.Productos
				.Where(p => ids.Contains(p.Id))
				.ToListAsync();
		}
	}
}
