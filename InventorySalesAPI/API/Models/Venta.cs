namespace API.Models
{
	public class Venta
	{
		public int Id { get; set; }
		public DateTime Date { get; set; }
		public decimal TotalAmount { get; set; }
		public string CustomerName { get; set; }

		public ICollection<VentaProducto> VentaProductos { get; set; } = new List<VentaProducto>();
	}
}
