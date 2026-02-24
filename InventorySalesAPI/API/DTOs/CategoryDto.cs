namespace API.DTOs
{
	public class CreateCategoryDto
	{
		public required string Nombre { get; set; }
	}

	public class CategoryResponseDto
	{
		public int Id { get; set; }
		public required string Nombre { get; set; }
	}
}
