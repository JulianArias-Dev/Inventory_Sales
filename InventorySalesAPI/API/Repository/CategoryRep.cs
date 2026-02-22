using API.Data;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
	public class CategoryRep : Repo
	{
		public CategoryRep(AppDbContext context) : base(context) { }

		public async Task<List<Categoria>> GetAllAsync()
		{
			return await _context.Categorias.ToListAsync();
		}

		public async Task<Categoria?> GetOne (int id)
		{
			return await _context.Categorias.FindAsync(id);
		}

		public async Task<Categoria> Create(Categoria categoria)
		{
			await _context.Categorias.AddAsync(categoria);
			await _context.SaveChangesAsync();

			return categoria;
		}

		public async Task<Categoria?> Update(int categoriaId, Categoria categoria)
		{
			var existingCategory = await _context.Categorias.FindAsync (categoriaId);

			if(existingCategory==null) 
				return null;

			existingCategory.Name = categoria.Name;

			await _context.SaveChangesAsync();

			return existingCategory;
		}

		public async Task<bool> HasRelation (int catId)
		{
			return
				await _context.Productos
				.AnyAsync(p => p.CategoriaId == catId);
		}

		public async Task<bool> Delete(Categoria categoria)
		{
			_context.Categorias.Remove(categoria);
			await _context.SaveChangesAsync();
			return true;

		}
	}
}
