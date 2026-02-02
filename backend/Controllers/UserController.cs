using backend.Models;
using backend.DTOs;
using backend.Services.IServices;
using backend.Services;
using backend.Helpers; 
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
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

                var user = await _userService.GetUserByEmail(loginDto.Email!);

        
                await _redisService.SaveUserSession(jwt, user.Id.ToString(), TimeSpan.FromMinutes(30));                ///TTL za SESIJU

                Response.Cookies.Append("jwt", jwt, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true, 
                    SameSite = SameSiteMode.None, 
                    MaxAge = TimeSpan.FromDays(1),
                    Path = "/"
                });

                return Ok(user);
            }
            catch (Exception e)
            {
                
                return BadRequest(new { message = e.Message });
            }
        }

        [HttpGet("GetUser")]
        public async Task<IActionResult> GetUser()
        {
            try
            {
                
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt))
                    return Unauthorized(new { message = "Niste prijavljeni (Kolacic nedostaje)." });

               
                if (!await _redisService.IsSessionActive(jwt))
                {
                    return Unauthorized(new { message = "Sesija je istekla." });
                }

                
                var user = await _userService.GetUser(jwt);

                
                await _redisService.SaveUserSession(jwt, user.Id.ToString(), TimeSpan.FromMinutes(30));

                return Ok(user);
            }
            catch (Exception ex)
            {
                
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("Logout")]
        public async Task<IActionResult> Logout()
        {
            var jwt = Request.Cookies["jwt"];
            if (!string.IsNullOrEmpty(jwt))
            {
                await _redisService.DeleteSession(jwt);
            }

            Response.Cookies.Delete("jwt", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });

            return Ok(new { message = "success" });
        }

        

        [HttpPut("Edit")]
        public async Task<IActionResult> Edit([FromForm] UserUpdateDTO userDto)
        {
            try
            {
              
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt) || !await _redisService.IsSessionActive(jwt))
                    return Unauthorized(new { message = "Niste autorizovani." });

            
                if (userDto.Image != null)
                {
                    
                    var wwwroot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    var uploads = Path.Combine(wwwroot, "uploads");

                  
                    if (!Directory.Exists(uploads))
                    {
                        Directory.CreateDirectory(uploads);
                    }

                  
                    string uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(userDto.Image.FileName)}";
                    var filePath = Path.Combine(uploads, uniqueName);

                    
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await userDto.Image.CopyToAsync(stream);
                    }

                    
                    userDto.ProfilePicture = uniqueName;
                }

               
                await _userService.UpdateProfile(userDto);

   
                var user = await _userService.GetUser(jwt);
                await _redisService.SaveUserSession(jwt, user.Id.ToString(), TimeSpan.FromMinutes(30));

             
                return Ok(new
                {
                    message = "Profil uspesno izmenjen.",
                    profilePicture = userDto.ProfilePicture
                });
            }
            catch (Exception e)
            {
           
                Console.WriteLine($"[Edit Error]: {e.Message}");
                return BadRequest(new { message = e.Message });
            }
        }

        [HttpPut("GiveAdmin")]
        public async Task<IActionResult> GiveAdmin([FromQuery] string username)
        {
            try
            {
                
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt) || !await _redisService.IsSessionActive(jwt))
                    return Unauthorized(new { message = "Niste autorizovani." });

                var currentUser = await _userService.GetUser(jwt);
                if (!currentUser.IsAdmin)
                {
                    return StatusCode(403, new { message = "Samo administrator moze dodeljivati admin privilegije." });
                }

                
                await _userService.MakeUserAdmin(username);

                return Ok(new { message = $"Korisnik {username} je uspesno postao administrator." });
            }
            catch (Exception e)
            {
                return BadRequest(new { message = e.Message });
            }
        }


        [HttpDelete("Delete")]
        public async Task<IActionResult> DeleteUser([FromQuery] string username)
        {
            try
            {
               
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt) || !await _redisService.IsSessionActive(jwt))
                    return Unauthorized(new { message = "Niste autorizovani." });

               
                var currentUser = await _userService.GetUser(jwt);
                if (!currentUser.IsAdmin)
                    return StatusCode(403, new { message = "Samo admin moze da brise korisnike." });

                
                await _userService.DeleteUser(username);

                return Ok(new { message = $"Korisnik {username} je uspesno obrisan iz sistema." });
            }
            catch (Exception e)
            {
                
                return BadRequest(new { message = e.Message });
            }
        }
    }
}