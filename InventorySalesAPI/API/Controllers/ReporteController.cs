using API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ReporteController : ControllerBase
	{

		private readonly ReportServices _service;

		public ReporteController(ReportServices service)
		{
			_service = service;
		}

		[HttpGet("ventas-por-dia")]
		public async Task<IActionResult> VentasPorDia()
		{
			return Ok(await _service.GetSalesByDay());
		}

		[HttpGet("productos-top/{top}")]
		public async Task<IActionResult> ProductosTop(int top)
		{
			return Ok(await _service.GetTopProducts(top));
		}

		[HttpGet("ventas-por-categoria")]
		public async Task<IActionResult> VentasPorCategoria()
		{
			return Ok(await _service.GetSalesByCategory());
		}

		[HttpGet("summary")]
		public async Task<IActionResult> Summary()
		{
			return Ok(await _service.GetCardSummaryAsync());
		}
	}
}
