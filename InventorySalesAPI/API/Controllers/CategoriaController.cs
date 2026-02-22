using API.Data;
using API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class CategoriaController : ControllerBase
	{
		private readonly AppDbContext _context;

		public CategoriaController(AppDbContext context)
		{
			_context = context;
		}

		[HttpGet]
		public async Task<IActionResult> GetCategorias()
		{
			var categorias = await _context.Categorias.ToListAsync();
			return Ok(categorias);
		}

		[HttpPost]
		public async Task<ActionResult<Categoria>> CreateCategoria([FromBody] Categoria categoria)
		{
			if (categoria == null || string.IsNullOrWhiteSpace(categoria.Name))
			{
				return BadRequest();
			}

			await _context.Categorias.AddAsync(categoria);
			await _context.SaveChangesAsync();

			return CreatedAtAction(
				nameof(GetCategorias),
				new { id = categoria.Id },
				categoria);
		}

	}
}
