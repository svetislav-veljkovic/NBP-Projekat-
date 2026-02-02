using backend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Repository
{
    public interface IUserRepository
    {
        
        Task<User> GetUserByEmail(string email);
        Task<User> GetUserByUsername(string username);
        Task<User> GetUserById(Guid id);
        Task<User> Create(User user);
        Task<User> UpdateUser(User user);
        Task Delete(Guid id);
        Task DeleteByUsername(string username); 
        Task UpdateAdminStatus(string username, bool isAdmin); 
        Task<IEnumerable<User>> GetAll();
    }
}