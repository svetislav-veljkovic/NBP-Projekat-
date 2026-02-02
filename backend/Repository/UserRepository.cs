using backend.Models;
using backend.Services;
using Cassandra;
using Cassandra.Mapping;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly Cassandra.ISession _session;
        private readonly IMapper _mapper;

        public UserRepository(CassandraService cassandraService)
        {
            _session = cassandraService.GetSession();
            _mapper = new Mapper(_session);
        }

        public async Task<User> GetUserByEmail(string email)
        {
            return await _mapper.FirstOrDefaultAsync<User>("SELECT * FROM user WHERE email = ?", email);
        }

        public async Task<User> GetUserByUsername(string username)
        {
          
            return await _mapper.FirstOrDefaultAsync<User>("SELECT * FROM user WHERE username = ? ALLOW FILTERING", username);
        }

        public async Task<User> GetUserById(Guid id)
        {
            return await _mapper.FirstOrDefaultAsync<User>("SELECT * FROM user WHERE id = ?", id);
        }

        public async Task<User> Create(User user)
        {
            await _mapper.InsertAsync(user);
            return user;
        }

        public async Task<User> UpdateUser(User user)
        {
            var cql = "UPDATE user SET name = ?, lastname = ?, profilepicture = ? WHERE id = ?";
            await _session.ExecuteAsync(new SimpleStatement(cql,
                user.Name,
                user.LastName,
                user.ProfilePicture,
                user.Id));

            return user;
        }

        public async Task Delete(Guid id)
        {
            await _session.ExecuteAsync(new SimpleStatement("DELETE FROM user WHERE id = ?", id));
        }

        public async Task<IEnumerable<User>> GetAll()
        {
            return await _mapper.FetchAsync<User>("SELECT * FROM user");
        }

       

        public async Task DeleteByUsername(string username)
        {
            
            var user = await GetUserByUsername(username);

            if (user != null)
            {
                
                var cql = "DELETE FROM user WHERE id = ?";
                await _session.ExecuteAsync(new SimpleStatement(cql, user.Id));
            }
            else
            {
                throw new Exception("Korisnik nije pronađen u bazi.");
            }
        }

        public async Task UpdateAdminStatus(string username, bool isAdmin)
        {
          
            var user = await GetUserByUsername(username);

            if (user != null)
            {
               
                var cql = "UPDATE user SET isadmin = ? WHERE id = ?";
                await _session.ExecuteAsync(new SimpleStatement(cql, isAdmin, user.Id));
            }
            else
            {
                throw new Exception("Korisnik nije pronađen u bazi.");
            }
        }
    }
}