using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Helpers
{
    public class JwtService
    {
       
        private const string SecureKey = "SuperSigurnaLozinkaZaTodoAplikaciju2026_Projekat!";

        public string Generate(string id)
        {
           
            var symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecureKey));
            var credentials = new SigningCredentials(symmetricSecurityKey, SecurityAlgorithms.HmacSha256Signature);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public JwtSecurityToken Verify(string jwt)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(SecureKey);

            try
            {
                tokenHandler.ValidateToken(jwt, new TokenValidationParameters
                {
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuerSigningKey = true,
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return (JwtSecurityToken)validatedToken;
            }
            catch (Exception ex)
            {
                
                throw new Exception("Nevalidni podaci u tokenu.");
            }
        }
    }
}