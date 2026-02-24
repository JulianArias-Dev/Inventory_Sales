namespace API.DTOs
{
	public class SalesReportDto
	{
		public required string fecha {  get; set; }
		public int cantidad { get; set; } 
		public decimal total { get; set; }
	}

	public class ProductSales
	{
		public int produtoId { get; set; }
		public required string nombre { get; set; }
		public int cantidad { get; set; }
		public decimal total { get; set; }
	}

	public class CategorySales
	{
		public int categoriaId { get; set; }
		public required string categoria { get; set; } 
		public int cantidad { get; set; }
		public decimal total { get; set; }
	}

	public class CardSalesDto
	{
		public int TotalVentas { get; set; }
		public decimal TotalIngresos { get; set; }
		public required TopProductoDto ProductoMasVendido { get; set; }
		public required TopCategoriaDto CategoriaMasVendida { get; set; }
	}

	public class TopProductoDto
	{
		public required string Nombre { get; set; }
		public int Cantidad { get; set; }
	}

	public class TopCategoriaDto
	{
		public required string Nombre { get; set; }
		public int Cantidad { get; set; }
	}
}
