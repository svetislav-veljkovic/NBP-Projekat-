using System;

namespace backend.Models
{
    public class User
    {
        
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? ProfilePicture { get; set; }
        public bool IsAdmin { get; set; }
        public DateTime CreatedAt { get; set; }

     
        public User()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
            IsAdmin = false;
        }

       
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