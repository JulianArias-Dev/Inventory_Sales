namespace API.DTOs
{
	public class CreateVentaDto
	{
		public required string CustomerName { get; set; }
		
		public List<CreateVentaProductoDto> Productos { get; set; } = new();
	}

	public class CreateVentaProductoDto
	{
		public int ProductoId { get; set; }
		public int Cantidad { get; set; }
	}

	public class VentaResponseDto
	{
		public int Id { get; set; }
		public DateTime Date { get; set; }
		public decimal TotalAmount { get; set; }
		public required string CustomerName { get; set; }

		public List<VentaProductoDto> Productos { get; set; } = new();
	}

	public class VentaProductoDto
	{
		public int ProductoId { get; set; }
		public required string ProductoNombre { get; set; }
		public int Cantidad { get; set; }
		public decimal PrecioUnitario { get; set; }
	}
}
