namespace backend.DTOs
{
    // Ovaj DTO služi samo da primimo ono što korisnik kuca u formu
    public class CreateTaskDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    // Ovaj DTO možemo koristiti za slanje podataka nazad na frontend (opciono)
    public class TaskResponseDTO
    {
        public string? Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
    }
}