using API.DTOs;
using API.Repository;

namespace API.Services
{
	public class ReportServices
	{
		private readonly ReportesRep _repository;

		public ReportServices(ReportesRep reportesRep)
		{
			_repository = reportesRep;
		}

		public async Task<List<ProductSales>> GetTopProducts(int top)
		{
			return await _repository.GetProductosMasVendidosAsync(top);
		}

		public async Task<List<CategorySales>> GetSalesByCategory()
		{
			return await _repository.GetVentasPorCategoriaAsync();
		}

		public async Task<List<SalesReportDto>> GetSalesByDay()
		{
			return await _repository.GetVentasPorDiaAsync();
		}

		public async Task<CardSalesDto> GetCardSummaryAsync()
		{
			var totalVentas = await _repository.GetTotalVentasAsync();
			var totalIngresos = await _repository.GetTotalIngresosAsync();

			var productoTop = (await _repository.GetProductosMasVendidosAsync(1))
								.FirstOrDefault();

			var categoriaTop = (await _repository.GetCategoriasMasVendidasAsync(1))
								.FirstOrDefault();

			return new CardSalesDto
			{
				TotalVentas = totalVentas,
				TotalIngresos = totalIngresos,
				ProductoMasVendido = productoTop == null
					? new TopProductoDto { Nombre = "", Cantidad = 0 }
					: new TopProductoDto
					{
						Nombre = productoTop.nombre,
						Cantidad = productoTop.cantidad
					},

				CategoriaMasVendida = categoriaTop == null
					? new TopCategoriaDto { Nombre = "", Cantidad = 0 }
					: new TopCategoriaDto
					{
						Nombre = categoriaTop.Nombre,
						Cantidad = categoriaTop.Cantidad
					}
			};
		}
	}
}
