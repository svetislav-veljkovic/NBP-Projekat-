# ToDo App (React + .NET + Cassandra)

Ova aplikacija omogućava upravljanje zadacima.
- **Backend:** .NET Web API, Cassandra, Redis, JWT Autentifikacija.
- **Frontend:** React (MDBootstrap, Ionicons).

## Pokretanje
1. Backend: `cd backend` -> `dotnet run`
2. Frontend: `cd frontend` -> `npm start`





1. 🗄️ Cassandra: "Glavna Arhiva" (Trajna memorija)
Cassandra je naš veliki, metalni ormar u koji slažemo sve što ne smemo da izgubimo.

Šta čuva: Sve korisnike i sve zadatke (i one koje tek treba da uradiš i one koje si davno završio).

Zašto baš ona: Jer je odlična kada treba da čuvamo ogromnu količinu podataka.

Mehanizam: Iz nje čitamo podatke za tvoj Dijagram Produktivnosti. Kada god završiš zadatak, on ostaje ovde zapisan zauvek, kako bi grafikon mogao da pokaže koliko si bio vredan pre 3 ili 30 dana.

2. ⚡ Redis: "Brza Tabla" (Privremena memorija)
Redis je kao bela tabla koja stoji na zidu kancelarije. Sve što je na njoj, vidi se odmah, ali se lako i obriše.

Scoreboard (Rang lista): Ovde koristimo Sorted Set. Čim završiš zadatak, tvoje ime "skoči" na tabli. Redis sam brine o tome ko je prvi, a ko drugi, pa ne moramo mi da računamo.

TTL (Time To Live) – "Dnevni Izazov": Ovo je naš mehanizam za brisanje. Podesili smo da se cela tabla sa poenima obriše nakon 24 sata. To znači da svaki dan počinje nova trka za prvo mesto!

Check-out mehanizam: Redis se koristi da "zaključa" ili brzo proveri status dok nešto radimo, jer je munjevito brz.

3. 🎫 JWT & Cookies: "Digitalna Propusnica"
Kada se jednom prijaviš (Login), ne moraš na svakih 5 sekundi da pokazuješ ličnu kartu.

Kako radi: Server ti da jedan "digitalni pečat" (JWT) koji se čuva u tvom pretraživaču kao kolačić (Cookie).

TTL sesije: I ova propusnica ima svoje vreme trajanja. Kada "istekne", aplikacija te automatski izloguje radi tvoje bezbednosti.





docker-compose up -d
docker exec -it cassandra-db cqlsh


-- Pravimo Keyspace
CREATE KEYSPACE IF NOT EXISTS todo_keyspace 
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

-- Ulazimo u njega
USE todo_keyspace;

-- Pravimo tabelu za korisnike
CREATE TABLE IF NOT EXISTS user (
    id uuid PRIMARY KEY,
    name text,
    lastname text,
    username text,
    email text,
    password text,
    profilepicture text,
    isadmin boolean,
    createdat timestamp
);

CREATE INDEX IF NOT EXISTS ON user (email);
CREATE INDEX IF NOT EXISTS ON user (username);


CREATE TABLE todo_task (
    id uuid,
    userid uuid,
    title text,
    description text,
    createdat timestamp,
    iscompleted boolean,
    PRIMARY KEY (userid, id)
);