using backend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Repository
{
    public interface IUserRepository
    {
        // Osnovne metode za Login i Registraciju
        Task<User> GetUserByEmail(string email);
        Task<User> GetUserByUsername(string username);
        Task<User> GetUserById(Guid id);

        // Upravljanje korisnikom
        Task<User> Create(User user);
        Task<User> UpdateUser(User user);

        // Brisanje po ID-u (ostavljamo tvoje) i dodajemo po username-u za frontend
        Task Delete(Guid id);
        Task DeleteByUsername(string username); // DODATO

        // Admin funkcije
        Task UpdateAdminStatus(string username, bool isAdmin); // DODATO
        Task<IEnumerable<User>> GetAll();
    }
}