using Cassandra;

namespace backend.Services
{
    public class CassandraService
    {
        private readonly Cassandra.ISession _session;

        public CassandraService()
        {
            var cluster = Cluster.Builder()
                .AddContactPoints("127.0.0.1") // Adresa tvoje Cassandre
                .Build();

            // Zameni 'todo_keyspace' imenom svog keyspace-a iz Cassandre
            _session = cluster.Connect("todo_keyspace");
        }

        public Cassandra.ISession GetSession() => _session;
    }
}