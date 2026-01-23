using backend.Models;
using backend.DTOs;
using System;
using System.Threading.Tasks;

namespace backend.Services.IServices // Dodato .IServices
{
    public interface IUserService
    {
        Task<User> Register(UserRegisterDTO userDto);
        Task<string> Login(string email, string password);
        Task<User> GetUser(string jwt);
        Task UpdateProfile(UserUpdateDTO userDto);
        Task<User> GetById(Guid id);
        Task MakeUserAdmin(string username);
        Task DeleteUser(string username);
    }
}