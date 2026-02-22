using API.Data;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class CategoriaController : ControllerBase
	{
		private readonly CategoryServices _services;

		public CategoriaController(AppDbContext context, CategoryServices categoryServices)
		{
			_services = categoryServices;
		}

		[HttpGet]
		public async Task<IActionResult> GetCategorias()
		{
			var categorias = await _services.GetAsync();
			return Ok(categorias);
		}

		[HttpGet("{categoryId}")]
		public async Task<ActionResult<Categoria>> GetCategoryById(int categoryId) { 
			var category = await _services.GetOneAsync(categoryId);

			if(category==null)
				return NotFound();

			return Ok(category);
		}


		[HttpPost]
		public async Task<ActionResult<Categoria>> CreateCategoria([FromBody] Categoria categoria)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			var newCategory = await _services.Create(categoria);

			return CreatedAtAction(
				nameof(GetCategoryById),
				new { id = categoria.Id },
				categoria);
		}

		[HttpDelete("{categoryId}")]
		public async Task<IActionResult> DeleteCategory(int categoryId)
		{
			var deleted = await _services.Delete(categoryId);

			if (!deleted)
				return NotFound();

			return NoContent();
		}

		[HttpPut("{categoryId}")]
		public async Task<IActionResult> UpdateCategory(int catId, Categoria categoria)
		{
			var updated = await _services.Update(catId, categoria);

			if (updated==null)
				return NotFound();

			return Ok(updated);
		}

	}
}
