using API.Models;

namespace API.DTOs
{
	
	public class CreateProductoDto
	{
		public string Name { get; set; }
		public decimal Price { get; set; }
		public int Stock { get; set; }
		public int CategoriaId { get; set; }
	}

	public class ProductoResponseDto
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public decimal Price { get; set; }
		public int Stock { get; set; }
		public int categoria { get; set; }
	}

	public class UpdateProductoDto
	{
		public string Name { get; set; } = string.Empty;
		public decimal Price { get; set; }
		public int Stock { get; set; }
		public int CategoriaId { get; set; }
	}

}
