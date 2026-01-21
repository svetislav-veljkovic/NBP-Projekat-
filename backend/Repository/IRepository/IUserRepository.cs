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
        Task<User> GetUserById(Guid id); // Promenjeno u Guid

        // Upravljanje korisnikom
        Task<User> Create(User user);
        Task<User> UpdateUser(User user);
        Task Delete(Guid id);

        // Za admin funkcije ili pretragu
        Task<IEnumerable<User>> GetAll();
    }
}