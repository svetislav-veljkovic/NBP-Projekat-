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
            // Povezujemo se na Cassandru preko tvog servisa
            _session = cassandraService.GetSession();
            // Mapper nam pomaže da lakše pretvaramo redove iz baze u User objekte
            _mapper = new Mapper(_session);
        }

        public async Task<User> GetUserByEmail(string email)
        {
            // PROMENJENO: users -> user (jer tvoja baza traži jedninu)
            return await _mapper.FirstOrDefaultAsync<User>("SELECT * FROM user WHERE email = ?", email);
        }

        public async Task<User> GetUserByUsername(string username)
        {
            // PROMENJENO: users -> user
            return await _mapper.FirstOrDefaultAsync<User>("SELECT * FROM user WHERE username = ?", username);
        }

        public async Task<User> GetUserById(Guid id)
        {
            // PROMENJENO: users -> user
            return await _mapper.FirstOrDefaultAsync<User>("SELECT * FROM user WHERE id = ?", id);
        }

        public async Task<User> Create(User user)
        {
            // Mapper će automatski pokušati da upiše u tabelu koja odgovara imenu klase 'User'
            await _mapper.InsertAsync(user);
            return user;
        }

        public async Task<User> UpdateUser(User user)
        {
            // Koristimo direktan CQL upit jer je sigurniji za Edit operacije
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
            // PROMENJENO: users -> user
            await _session.ExecuteAsync(new SimpleStatement("DELETE FROM user WHERE id = ?", id));
        }

        public async Task<IEnumerable<User>> GetAll()
        {
            // PROMENJENO: users -> user
            return await _mapper.FetchAsync<User>("SELECT * FROM user");
        }
    }
}