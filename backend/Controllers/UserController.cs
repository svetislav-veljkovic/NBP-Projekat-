using backend.Models;
using backend.DTOs;
using backend.Services.IServices;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly RedisService _redisService;

        public UserController(IUserService userService, RedisService redisService)
        {
            _userService = userService;
            _redisService = redisService;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDTO userDto)
        {
            try
            {
                var user = await _userService.Register(userDto);
                return Created("success", user);
            }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDTO loginDto)
        {
            try
            {
                var jwt = await _userService.Login(loginDto.Email!, loginDto.Password!);
                Response.Cookies.Append("jwt", jwt, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    MaxAge = TimeSpan.FromDays(1)
                });
                return Ok(new { message = "success" });
            }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        [HttpGet("GetUser")]
        public async Task<IActionResult> GetUser()
        {
            try
            {
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt)) return Unauthorized();
                var user = await _userService.GetUser(jwt);
                return Ok(user);
            }
            catch { return Unauthorized(); }
        }

        [HttpPost("Logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt", new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.None });
            return Ok(new { message = "success" });
        }

        // VRACENO NA STARO IME: Frontend traži "/api/User/Edit"
        [HttpPut("Edit")]
        public async Task<IActionResult> Edit([FromBody] UserUpdateDTO userDto)
        {
            try
            {
                await _userService.UpdateProfile(userDto);
                return Ok(new { message = "Profile Edited" });
            }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        // VRACENO NA STARO IME: "/api/User/GiveAdmin"
        [HttpPut("GiveAdmin")]
        public async Task<IActionResult> GiveAdmin([FromQuery] string username)
        {
            try
            {
                await _userService.MakeUserAdmin(username);
                return Ok(new { message = $"Korisnik {username} je postao admin." });
            }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        // VRACENO NA STARO IME: "/api/User/Delete"
        [HttpDelete("Delete")]
        public async Task<IActionResult> DeleteUser([FromQuery] string username)
        {
            try
            {
                await _userService.DeleteUser(username);
                return Ok(new { message = "Korisnik uspešno obrisan." });
            }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

        // VRACENO NA STARO IME: "/api/User/Scoreboard"
        [HttpGet("Scoreboard")]
        public async Task<IActionResult> GetScoreboard()
        {
            try
            {
                var topUsers = await _redisService.GetTopUsers(10);
                var result = topUsers.Select(x => new { username = x.Key, points = x.Value });
                return Ok(result);
            }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }
    }
}