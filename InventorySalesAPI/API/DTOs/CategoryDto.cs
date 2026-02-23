namespace API.DTOs
{
	public class CreateCategoryDto
	{
		public string Nombre { get; set; }
	}

	public class CategoryResponseDto
	{
		public int Id { get; set; }
		public string Nombre { get; set; }
	}
}
