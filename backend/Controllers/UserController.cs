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
                var user = await _userService.GetUser(jwt);

                // REDIS TTL SESIJA: Prvo postavljanje sesije na 1 minut
                await _redisService.SaveUserSession(user.Id.ToString(), "active", TimeSpan.FromMinutes(1));

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

                // 1. Provera da li je sesija i dalje aktivna u Redisu
                if (!await _redisService.IsSessionActive(user.Id.ToString()))
                    return Unauthorized(new { message = "Session expired in Redis" });

                // 2. PRODUŽAVANJE (Sliding Expiration): 
                // Svaki put kad frontend (Navbar) pozove GetUser, resetujemo Redis na novih 1 min
                await _redisService.SaveUserSession(user.Id.ToString(), "active", TimeSpan.FromMinutes(1));

                return Ok(user);
            }
            catch { return Unauthorized(); }
        }

        [HttpPost("Logout")]
        public async Task<IActionResult> Logout()
        {
            var jwt = Request.Cookies["jwt"];
            if (!string.IsNullOrEmpty(jwt))
            {
                try
                {
                    var user = await _userService.GetUser(jwt);
                    // Brišemo sesiju iz Redisa odmah (postavljanjem na 1ms ili Delete metodom ako je imaš)
                    await _redisService.SaveUserSession(user.Id.ToString(), "", TimeSpan.FromMilliseconds(1));
                }
                catch { }
            }

            Response.Cookies.Delete("jwt", new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.None });
            return Ok(new { message = "success" });
        }

        [HttpPut("Edit")]
        public async Task<IActionResult> Edit([FromBody] UserUpdateDTO userDto)
        {
            try
            {
                // I ovde možemo produžiti sesiju jer je korisnik aktivan
                var jwt = Request.Cookies["jwt"];
                if (!string.IsNullOrEmpty(jwt))
                {
                    var user = await _userService.GetUser(jwt);
                    await _redisService.SaveUserSession(user.Id.ToString(), "active", TimeSpan.FromMinutes(1));
                }

                await _userService.UpdateProfile(userDto);
                return Ok(new { message = "Profile Edited" });
            }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }

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

        [HttpGet("Scoreboard")]
        public async Task<IActionResult> GetScoreboard()
        {
            try
            {
                // Uzimamo podatke direktno iz našeg Weekly Redis servisa
                var topUsers = await _redisService.GetTopUsers(10);
                var result = topUsers.Select(x => new { key = x.Key, value = x.Value });

                // Opciono: I ovde možeš dodati produžavanje sesije ako želiš 
                // da rang lista "drži" korisnika ulogovanim.

                return Ok(result);
            }
            catch (Exception e) { return BadRequest(new { message = e.Message }); }
        }
    }
}