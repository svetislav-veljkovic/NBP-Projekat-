using backend.Models;
using backend.DTOs;
using backend.Repository;
using backend.Helpers;
using backend.Services.IServices; // Obavezno uvozimo interfejs
using System;
using System.Threading.Tasks;
using BCrypt.Net;

namespace backend.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtService _jwtService;

        public UserService(IUserRepository userRepository, JwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        public async Task<User> Register(UserRegisterDTO userDto)
        {
            // 1. Provera postojanja korisnika
            var userFound = await _userRepository.GetUserByEmail(userDto.Email!);
            if (userFound != null) throw new Exception("User with this email already exists.");

            userFound = await _userRepository.GetUserByUsername(userDto.Username!);
            if (userFound != null) throw new Exception("User with this username already exists.");

            // 2. Provera lozinke
            if (userDto.Password != userDto.RepeatedPassword)
                throw new Exception("Password mismatch");

            // 3. Kreiranje modela
            var userCreated = new User(
                userDto.Name!,
                userDto.LastName!,
                userDto.Username!,
                userDto.Email!,
                BCrypt.Net.BCrypt.HashPassword(userDto.Password!), // Dodat !
                userDto.ProfilePicture ?? "default.png"
            );

            return await _userRepository.Create(userCreated);
        }

        public async Task<string> Login(string email, string password)
        {
            var userFound = await _userRepository.GetUserByEmail(email);

            if (userFound == null) throw new Exception("User with that mail doesn't exist");

            if (!BCrypt.Net.BCrypt.Verify(password, userFound.Password))
                throw new Exception("Wrong password!");

            return _jwtService.Generate(userFound.Id.ToString());
        }

        public async Task UpdateProfile(UserUpdateDTO userDto)
        {
            if (!Guid.TryParse(userDto.Id, out Guid guidId))
                throw new Exception("Invalid User ID format");

            var userFound = await _userRepository.GetUserById(guidId);
            if (userFound == null) throw new Exception("User not found");

            userFound.Name = userDto.Name ?? userFound.Name;
            userFound.LastName = userDto.LastName ?? userFound.LastName;
            userFound.ProfilePicture = userDto.ProfilePicture ?? userFound.ProfilePicture;

            await _userRepository.UpdateUser(userFound);
        }

        public async Task<User> GetUser(string jwt)
        {
            var token = _jwtService.Verify(jwt);
            var userIdString = token.Subject;

            if (!Guid.TryParse(userIdString, out Guid guidId))
                throw new Exception("Invalid Token data");

            var user = await _userRepository.GetUserById(guidId);
            if (user == null) throw new Exception("User not found");

            return user;
        }

        public async Task<User> GetById(Guid id)
        {
            var user = await _userRepository.GetUserById(id);
            if (user == null) throw new Exception("User not found");
            return user;
        }
    }
}