using API.Data;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repository

{
	public class ProductRep : Repo
	{
		public ProductRep(AppDbContext context) : base(context)
		{ 
			
		}

		public async Task<List<Producto>> GetAllAsync()
		{
			return await _context.Productos.ToListAsync();
		}

		public async Task<Producto?> GetOne(int productId)
		{
			return await _context.Productos.FindAsync(productId);
		}
	}
}
