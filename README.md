# To Do App (React + .NET + Cassandra + Redis)

Ovaj projekat predstavlja naprednu aplikaciju za upravljanje zadacima, baziranu na mikroservisnoj logici sa fokusom na brzinu i skalabilnost podataka.

## Tehnoloski Stack

* **Frontend**: React.js (MDBootstrap, React-Toastify, Chart.js)
* **Backend**: .NET Web API
* **Baza podataka**: Apache Cassandra (Primarno skladiste)
* **Caching & Leaderboard**: Redis
* **Autentifikacija**: JWT (JSON Web Token) smesten u Cookies

## Arhitektura i Tehnologije

### 1. Apache Cassandra - Primarna Baza Podataka
Cassandra se koristi kao distribuirano skladiste za trajno cuvanje podataka.
* **Skladistenje**: Cuva sve korisnicke profile i istoriju zadataka.
* **Analitika**: Omogucava citanje podataka za **Dijagram Produktivnosti**. Svi zavrseni zadaci ostaju trajno zapisani kako bi grafikon mogao da prikaze ucinak korisnika kroz duzi vremenski period.


### 2. Redis - High-Speed Data & Leaderboard
Redis sluzi kao sloj za kesiranje i obradu podataka u realnom vremenu.
* **Scoreboard (Rang lista)**: Koriscenjem **Sorted Set** strukture, Redis automatski rangira korisnike prema poenima. Cim se zadatak zavrsi, podaci se azuriraju.
* **TTL (Time To Live) Mehanizam**: Rang lista je konfigurisana da se resetuje na svakih 24 sata, cime se podstice dnevna aktivnost korisnika.


### 3. Sigurnost i Autentifikacija
* **JWT & Cookies**: Sistem koristi  (JWT) koji se cuva unutar HTTP-only kolacica, cime se sprecavaju XSS napadi.
* **Session Management**: Sesije imaju definisano vreme trajanja. Nakon isteka, korisnik se automatski odjavljuje radi zastite podataka.

## Instalacija i Pokretanje

### Baza Podataka (Docker)
Pokretanje Cassandra i Redis kontejnera:

docker-compose up -d

### Backend (API)
Pokretanje:

cd backend
dotnet run

### Frontend (React)
Pokretanje:

cd frontend
npm install
npm start