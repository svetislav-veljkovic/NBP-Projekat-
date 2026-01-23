using backend.Models;
using backend.DTOs;
using backend.Repository;
using backend.Helpers;
using backend.Services.IServices;
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
            // Osiguravamo da su email i username uvek mala slova pre provere i upisa
            string lowerEmail = userDto.Email!.ToLower();
            string lowerUsername = userDto.Username!.ToLower();

            var userFound = await _userRepository.GetUserByEmail(lowerEmail);
            if (userFound != null) throw new Exception("User with this email already exists.");

            userFound = await _userRepository.GetUserByUsername(lowerUsername);
            if (userFound != null) throw new Exception("User with this username already exists.");

            if (userDto.Password != userDto.RepeatedPassword)
                throw new Exception("Password mismatch");

            var userCreated = new User(
                userDto.Name!,
                userDto.LastName!,
                lowerUsername, // Čuvamo mali username
                lowerEmail,    // Čuvamo mali email
                BCrypt.Net.BCrypt.HashPassword(userDto.Password!),
                userDto.ProfilePicture ?? "default.png"
            );

            return await _userRepository.Create(userCreated);
        }

        public async Task<string> Login(string email, string password)
        {
            // Login pretraga uvek sa malim slovima
            var userFound = await _userRepository.GetUserByEmail(email.ToLower());

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

        // --- ADMIN METODE SA TOLOWER() ZAŠTITOM ---

        public async Task MakeUserAdmin(string username)
        {
            string lowerUsername = username.ToLower();
            var user = await _userRepository.GetUserByUsername(lowerUsername);

            if (user == null) throw new Exception("Korisnik sa tim korisničkim imenom ne postoji.");

            await _userRepository.UpdateAdminStatus(lowerUsername, true);
        }

        public async Task DeleteUser(string username)
        {
            string lowerUsername = username.ToLower();
            var user = await _userRepository.GetUserByUsername(lowerUsername);

            if (user == null) throw new Exception("Korisnik nije pronađen.");

            await _userRepository.DeleteByUsername(lowerUsername);
        }
    }
}