using System;

namespace backend.Models
{
    public class User
    {
        // U Cassandri koristimo Guid (UUID) za primarni ključ
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? ProfilePicture { get; set; }
        public bool IsAdmin { get; set; }

        // Dodajemo polje koje je bitno za To-Do temu
        public DateTime CreatedAt { get; set; }

        // Prazan konstruktor je neophodan za serijalizaciju
        public User()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
            IsAdmin = false;
        }

        // Konstruktor za registraciju
        public User(string name, string lastName, string username, string email, string password, string profilePicture)
        {
            Id = Guid.NewGuid();
            Name = name;
            LastName = lastName;
            Username = username;
            Email = email;
            Password = password;
            ProfilePicture = profilePicture;
            CreatedAt = DateTime.UtcNow;
            IsAdmin = false;
        }
    }
}