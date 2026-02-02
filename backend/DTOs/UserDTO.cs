
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
namespace backend.DTOs
{
    public class UserDTO
    {
        public string? Name { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? ProfilePicture { get; set; }
        public bool IsAdmin { get; set; } // NOVO: Za React Navbar login logiku
    }

    public class UserRegisterDTO
    {
        public string? Name { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? RepeatedPassword { get; set; }
        public string? ProfilePicture { get; set; }
    }

    public class UserUpdateDTO
    {
        [FromForm(Name = "id")]
        public string? Id { get; set; }

        [FromForm(Name = "name")]
        public string? Name { get; set; }

        [FromForm(Name = "lastName")]
        public string? LastName { get; set; }

        [FromForm(Name = "image")]
        public IFormFile? Image { get; set; }

        // Ovo polje popunjavamo u kontroleru, ne dolazi sa frontenda
        public string? ProfilePicture { get; set; }
    }
    public class UserLoginDTO
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    public class UserGetDTO
    {
        public string? Id { get; set; }
        public string? Username { get; set; }
        public bool IsAdmin { get; set; } // NOVO
    }
}