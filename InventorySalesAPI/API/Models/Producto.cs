namespace API.Models
{
	public class Producto
	{
		public int Id { get; set; }
		public string Name { get; set; }
		public decimal Price { get; set; }
		public int Stock { get; set; }
		public int CategoriaId { get; set; }

		public ICollection<VentaProducto> VentaProductos { get; set; }
	}
}
