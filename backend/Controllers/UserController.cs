using backend.Helpers;
using backend.Services;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDTO user)
        {
            try
            {
                var result = await _userService.Register(user);
                return Created("success", result);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDTO user)
        {
            try
            {
                var jwt = await _userService.Login(user.Email!, user.Password!);

                Response.Cookies.Append("jwt", jwt, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    MaxAge = TimeSpan.FromDays(1)
                });

                return Ok(new { message = "success" });
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("GetUser")]
        public async Task<IActionResult> GetUser()
        {
            try
            {
                var jwt = Request.Cookies["jwt"];
                var user = await _userService.GetUser(jwt!);
                return Ok(user);
            }
            catch
            {
                return Unauthorized();
            }
        }

        [HttpPost("Logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt", new CookieOptions
            {
                SameSite = SameSiteMode.None,
                Secure = true,
                HttpOnly = true
            });

            return Ok(new { message = "success" });
        }

        [HttpPut("Edit")]
        public async Task<IActionResult> Edit([FromBody] UserUpdateDTO user)
        {
            try
            {
                await _userService.UpdateProfile(user);
                return Ok("Profile Edited");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        // --- NOVE METODE ZA ADMINA ---

        [HttpPut("GiveAdmin")]
        public async Task<IActionResult> GiveAdmin([FromQuery] string username)
        {
            try
            {
                // Pozivamo servis koji smo dogovorili da napraviš
                await _userService.MakeUserAdmin(username);
                return Ok(new { message = $"Korisnik {username} je postao admin." });
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpDelete("Delete")]
        public async Task<IActionResult> DeleteUser([FromQuery] string username)
        {
            try
            {
                await _userService.DeleteUser(username);
                return Ok(new { message = "Korisnik uspešno obrisan." });
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}