using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using API.Data;

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
		public IActionResult GetCategorias()
		{
			var categorias = _context.Categorias.ToList();
			return Ok(categorias);
		}

		[HttpPost]
		public IActionResult CreateCategoria([FromBody] Models.Categoria categoria)
		{
			if (categoria == null || string.IsNullOrEmpty(categoria.Name))
			{
				return BadRequest("O nome da categoria é obrigatório.");
			}
			_context.Categorias.Add(categoria);
			_context.SaveChanges();
			return CreatedAtAction(nameof(GetCategorias), new { id = categoria.Id }, categoria);
		}

	}
}
