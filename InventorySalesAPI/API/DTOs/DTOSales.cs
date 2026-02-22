namespace API.DTOs
{
	public class CreateVentaDto
	{
		public string CustomerName { get; set; }
		public DateTime Date { get; set; }

		public List<CreateVentaProductoDto> Productos { get; set; } = new();
	}

	public class CreateVentaProductoDto
	{
		public int ProductoId { get; set; }
		public int Cantidad { get; set; }
		public decimal PrecioUnitario { get; set; }
	}
}
