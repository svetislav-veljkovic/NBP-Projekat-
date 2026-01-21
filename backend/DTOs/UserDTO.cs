using System;

namespace backend.DTOs
{
    // Koristi se za slanje osnovnih podataka o korisniku na frontend
    public class UserDTO
    {
        public string? Name { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? ProfilePicture { get; set; }
    }

    // Podaci potrebni za registraciju novog korisnika
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

    // Podaci koje korisnik može da ažurira na svom profilu
    public class UserUpdateDTO
    {
        public string? Id { get; set; } // Promenjeno u string zbog Cassandre
        public string? Name { get; set; }
        public string? LastName { get; set; }
        public string? ProfilePicture { get; set; }
    }

    // Podaci za Login
    public class UserLoginDTO
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    // Minimalni podaci o korisniku (npr. za rang listu u Redis-u)
    public class UserGetDTO
    {
        public string? Id { get; set; }
        public string? Username { get; set; }
    }
}