using backend.Models;
using backend.DTOs;
using backend.Services.IServices;
using backend.Services;
using backend.Helpers; // Dodato za pristup JwtService ako zatreba
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
                // 1. Dobijamo JWT (Login metoda u servisu ne sme da zove Verify!)
                var jwt = await _userService.Login(loginDto.Email!, loginDto.Password!);

                // 2. Uzimamo podatke o korisniku preko Email-a (izbegavamo dekodiranje tokena ovde)
                var user = await _userService.GetUserByEmail(loginDto.Email!);

                // 3. UPIS U REDIS (Token je ključ, UserID je vrednost)
                await _redisService.SaveUserSession(jwt, user.Id.ToString(), TimeSpan.FromMinutes(5));                ///TTL za SESIJU

                // 4. POSTAVLJANJE KOLAČIĆA
                Response.Cookies.Append("jwt", jwt, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true, // Mora biti true jer koristiš HTTPS (localhost:7248)
                    SameSite = SameSiteMode.None, // Dozvoljava cross-origin između 3000 i 7248
                    MaxAge = TimeSpan.FromDays(1),
                    Path = "/"
                });

                return Ok(user);
            }
            catch (Exception e)
            {
                // Ako ovde dobiješ "Nevalidni podaci", proveri da li tvoj UserService.Login poziva JwtService.Verify
                return BadRequest(new { message = e.Message });
            }
        }

        [HttpGet("GetUser")]
        public async Task<IActionResult> GetUser()
        {
            try
            {
                // Uzimamo token iz kolačića
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt))
                    return Unauthorized(new { message = "Niste prijavljeni (Kolačić nedostaje)." });

                // 1. Provera u Redisu (Ovo je brže od baze)
                if (!await _redisService.IsSessionActive(jwt))
                {
                    return Unauthorized(new { message = "Sesija je istekla." });
                }

                // 2. Tek ako je sesija u Redisu aktivna, tražimo korisnika
                // Unutar GetUser(jwt) se verovatno nalazi JwtService.Verify(jwt)
                var user = await _userService.GetUser(jwt);

                // 3. Sliding expiration: Korisnik je aktivan, produži mu sesiju u Redisu
                await _redisService.SaveUserSession(jwt, user.Id.ToString(), TimeSpan.FromMinutes(30));

                return Ok(user);
            }
            catch (Exception ex)
            {
                // Ovde hvataš "Nevalidni podaci u tokenu" ako Verify ne prođe
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

        // --- Ostale metode ostaju slične, ali dodaj proveru sesije ---

        [HttpPut("Edit")]
        public async Task<IActionResult> Edit([FromForm] UserUpdateDTO userDto)
        {
            try
            {
                // 1. Provera sesije i JWT-a
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt) || !await _redisService.IsSessionActive(jwt))
                    return Unauthorized(new { message = "Niste autorizovani." });

                // 2. Logika za procesuiranje slike
                if (userDto.Image != null)
                {
                    // Definišemo korenski folder i folder za upload
                    var wwwroot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    var uploads = Path.Combine(wwwroot, "uploads");

                    // OVO JE KLJUČNO: Ako folder ne postoji, napravi ga (rešava "Could not find a part of the path")
                    if (!Directory.Exists(uploads))
                    {
                        Directory.CreateDirectory(uploads);
                    }

                    // Generišemo unikatno ime fajla da izbegnemo konflikte (npr. marko.png postane guid.png)
                    string uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(userDto.Image.FileName)}";
                    var filePath = Path.Combine(uploads, uniqueName);

                    // Čuvanje fajla na disk
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await userDto.Image.CopyToAsync(stream);
                    }

                    // Upisujemo novi naziv slike u DTO koji prosleđujemo dalje servisu
                    userDto.ProfilePicture = uniqueName;
                }

                // 3. Ažuriranje podataka u bazi preko servisa
                await _userService.UpdateProfile(userDto);

                // 4. Osvežavanje podataka o korisniku i produžavanje sesije u Redisu
                var user = await _userService.GetUser(jwt);
                await _redisService.SaveUserSession(jwt, user.Id.ToString(), TimeSpan.FromMinutes(30));

                // Vraćamo uspeh i naziv nove slike frontendu
                return Ok(new
                {
                    message = "Profil uspešno izmenjen.",
                    profilePicture = userDto.ProfilePicture
                });
            }
            catch (Exception e)
            {
                // Logujemo grešku u konzolu radi lakšeg debagovanja
                Console.WriteLine($"[Edit Error]: {e.Message}");
                return BadRequest(new { message = e.Message });
            }
        }

        [HttpPut("GiveAdmin")]
        public async Task<IActionResult> GiveAdmin([FromQuery] string username)
        {
            try
            {
                // 1. Provera sesije (samo ulogovani korisnici)
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt) || !await _redisService.IsSessionActive(jwt))
                    return Unauthorized(new { message = "Niste autorizovani." });

                // 2. Provera da li je trenutni korisnik zapravo ADMIN
                var currentUser = await _userService.GetUser(jwt);
                if (!currentUser.IsAdmin)
                {
                    return StatusCode(403, new { message = "Samo administrator može dodeljivati admin privilegije." });
                }

                // 3. Poziv servisa za unapređenje drugog korisnika
                await _userService.MakeUserAdmin(username);

                return Ok(new { message = $"Korisnik {username} je uspešno postao administrator." });
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
                // 1. Provera sesije admina
                var jwt = Request.Cookies["jwt"];
                if (string.IsNullOrEmpty(jwt) || !await _redisService.IsSessionActive(jwt))
                    return Unauthorized(new { message = "Niste autorizovani." });

                // 2. Provera da li je onaj ko briše zapravo ADMIN
                var currentUser = await _userService.GetUser(jwt);
                if (!currentUser.IsAdmin)
                    return StatusCode(403, new { message = "Samo admin može da briše korisnike." });

                // 3. Poziv servisa za brisanje (Cassandra + Redis)
                await _userService.DeleteUser(username);

                return Ok(new { message = $"Korisnik {username} je uspešno obrisan iz sistema." });
            }
            catch (Exception e)
            {
                // Ako UserService baci "Korisnik nije pronađen", to hvataš ovde
                return BadRequest(new { message = e.Message });
            }
        }
    }
}