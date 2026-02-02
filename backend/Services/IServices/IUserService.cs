using backend.Models;
using backend.DTOs;
using System;
using System.Threading.Tasks;

namespace backend.Services.IServices
{
    public interface IUserService
    {
        Task<User> Register(UserRegisterDTO userDto);
        Task<string> Login(string email, string password);
        Task<User> GetUser(string jwt);
        Task<User> GetUserById(Guid id); 
        Task<User> GetUserByEmail(string email);
        Task UpdateProfile(UserUpdateDTO userDto);
        Task MakeUserAdmin(string username);
        Task DeleteUser(string username);
    }
}