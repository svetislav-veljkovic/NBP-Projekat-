using backend.DTOs;
using backend.Helpers;
using backend.Models;
using backend.Repository;
using backend.Services.IServices;
using BCrypt.Net;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly JwtService _jwtService;
        private readonly RedisService _redisService;

        
        public UserService(IUserRepository userRepository, ITaskRepository taskRepository, JwtService jwtService, RedisService redisService)
        {
            _userRepository = userRepository;
            _taskRepository = taskRepository;
            _jwtService = jwtService;
            _redisService = redisService;
        }

       
        public async Task<User> Register(UserRegisterDTO userDto)
        {
            string lowerEmail = userDto.Email!.ToLower().Trim();
            string lowerUsername = userDto.Username!.ToLower().Trim();

            var userFound = await _userRepository.GetUserByEmail(lowerEmail);
            if (userFound != null) throw new Exception("Korisnik sa ovim email-om vec postoji.");

            userFound = await _userRepository.GetUserByUsername(lowerUsername);
            if (userFound != null) throw new Exception("Korisnicko ime je zauzeto.");

            if (userDto.Password != userDto.RepeatedPassword)
                throw new Exception("Lozinke se ne podudaraju.");

            var userCreated = new User(
                userDto.Name!,
                userDto.LastName!,
                lowerUsername,
                lowerEmail,
                BCrypt.Net.BCrypt.HashPassword(userDto.Password!),
                userDto.ProfilePicture ?? "default.png"
            );

            var savedUser = await _userRepository.Create(userCreated);
            await _redisService.SaveUserHash(savedUser.Id.ToString(), savedUser.Username, 0);

            return savedUser;
        }

       
        public async Task<string> Login(string email, string password)
        {
            var userFound = await _userRepository.GetUserByEmail(email.ToLower().Trim());
            if (userFound == null) throw new Exception("Korisnik sa tim email-om ne postoji.");

            if (!BCrypt.Net.BCrypt.Verify(password, userFound.Password))
                throw new Exception("Pogresna lozinka!");

            return _jwtService.Generate(userFound.Id.ToString());
        }

   
        public async Task UpdateProfile(UserUpdateDTO userDto)
        {
            if (!Guid.TryParse(userDto.Id, out Guid guidId))
                throw new Exception("Nevalidan ID format.");

            var userFound = await _userRepository.GetUserById(guidId);
            if (userFound == null) throw new Exception("Korisnik nije pronadjen.");

            userFound.Name = userDto.Name ?? userFound.Name;
            userFound.LastName = userDto.LastName ?? userFound.LastName;
            userFound.ProfilePicture = userDto.ProfilePicture ?? userFound.ProfilePicture;

            await _userRepository.UpdateUser(userFound);
        }

        
        public async Task<User> GetUser(string jwt)
        {
            var token = _jwtService.Verify(jwt);
            var userIdString = token.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value
                               ?? token.Subject;

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid guidId))
                throw new Exception("Nevalidni podaci u tokenu (ID nije pronadjen).");

            return await GetUserById(guidId);
        }

        public async Task<User> GetUserById(Guid id)
        {
            var user = await _userRepository.GetUserById(id);
            if (user == null) throw new Exception("Korisnik nije pronadjen.");
            return user;
        }

        public async Task<User> GetById(Guid id) => await GetUserById(id);

        public async Task<User> GetUserByEmail(string email)
        {
            var user = await _userRepository.GetUserByEmail(email.ToLower().Trim());
            if (user == null) throw new Exception("Korisnik nije pronadjen.");
            return user;
        }

      
        public async Task MakeUserAdmin(string username)
        {
            string lowerUsername = username.ToLower().Trim();
            var user = await _userRepository.GetUserByUsername(lowerUsername);

            if (user == null) throw new Exception("Korisnik sa tim korisnickim imenom ne postoji.");

            await _userRepository.UpdateAdminStatus(lowerUsername, true);
        }

        public async Task DeleteUser(string username)
        {
            string lowerUsername = username.ToLower().Trim();

            var user = await _userRepository.GetUserByUsername(lowerUsername);
            if (user == null) throw new Exception("Korisnik nije pronadjen.");

            await _taskRepository.DeleteAllByUserId(user.Id);

            await _userRepository.DeleteByUsername(lowerUsername);

            await _redisService.RemoveUserAllData(user.Id.ToString(), user.Username);
        }
    }
}