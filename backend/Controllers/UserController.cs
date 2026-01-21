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

        // Koristimo Dependency Injection - ASP.NET sam ubacuje UserService ovde
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

                // Smeštanje JWT-a u HttpOnly cookie radi sigurnosti
                Response.Cookies.Append("jwt", jwt, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true, // Mora biti true za SameSite.None
                    SameSite = SameSiteMode.None,
                    MaxAge = TimeSpan.FromDays(1) // Dodaj trajanje
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
    }
}