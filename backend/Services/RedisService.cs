using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class RedisService
    {
        private readonly IDatabase _db;
        private const string ScoreboardKey = "todo_weekly_scoreboard";

        public RedisService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }

        // Povećava poene i postavlja NEDELJNI TTL
        public async Task IncrementScore(string username, double points = 10)
        {
            await _db.SortedSetIncrementAsync(ScoreboardKey, username, points);

            var currentTtl = await _db.KeyTimeToLiveAsync(ScoreboardKey);

            // Ako tabela nema TTL (nova je nedelja), postavljamo na 7 dana
            if (currentTtl == null || currentTtl.Value.TotalSeconds < 0)
            {
                // 7 dana = Nedeljni ciklus takmičenja
                await _db.KeyExpireAsync(ScoreboardKey, TimeSpan.FromDays(7));
            }
        }

        public async Task<List<KeyValuePair<string, double>>> GetTopUsers(int count = 10)
        {
            var results = await _db.SortedSetRangeByRankWithScoresAsync(ScoreboardKey, 0, count - 1, Order.Descending);
            return results.Select(x => new KeyValuePair<string, double>(x.Element!, x.Score)).ToList();
        }

        // NOVO: Upravljanje sesijom korisnika (TTL Sesija)
        // Ovo zoveš u Login kontroleru
        public async Task SaveUserSession(string userId, string sessionData, TimeSpan expiry)
        {
            // Ključ: session:id_korisnika, Vrednost: podaci, TTL: npr. 2 sata
            await _db.StringSetAsync($"session:{userId}", sessionData, expiry);
        }

        // Provera da li je sesija još uvek u Redis-u (Active Session)
        public async Task<bool> IsSessionActive(string userId)
        {
            return await _db.KeyExistsAsync($"session:{userId}");
        }
    }
}