import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { infinite } from 'ionicons/icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import background from './background.jpg';
import { Typewriter, Cursor } from 'react-simple-typewriter'

function Home() {
  const navigate = useNavigate();
  const [bestUsers, setBestUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = "https://localhost:7248/api/User";

  useEffect(() => {
    const fetchScoreboard = async () => {
      try {
        // Pretpostavljamo da tvoj Redis Scoreboard vraća listu najboljih
        const response = await fetch(`${baseUrl}/GetAll`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          mode: 'cors',
        });

        if (response.ok) {
          const data = await response.json();
          // Uzimamo top 3 za početnu stranu
          setBestUsers(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching scoreboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScoreboard();
  }, []);

  return (
    <>
      <div className='background'>
        <img className='background-img' src={background} alt="Background" />
        <div className='animation-text'>
          <h2>
            <Typewriter 
              words={['Organizuj svoje obaveze.', 'Budi produktivan svaki dan.']} 
              loop={infinite} 
              typeSpeed={50} 
              deleteSpeed={50} 
            />
            <Cursor />
          </h2>
        </div>
      </div>

      <h2 className='recommended-title'>Najbolje rangirani korisnici (Scoreboard)</h2>
      <div className="bestFixers">
        {loading ? <p>Učitavanje rang liste...</p> : 
          bestUsers.map(user => (
            <div key={user.id} className='oneBestFixer' onClick={() => navigate('/profile')}>
              <div className='nameLastName'>
                <h3>{user.name} {user.lastName}</h3>
              </div>
              <h4>@{user.username}</h4>
              <div className='stats'>
                <p>Poeni: {user.points || 0}</p>
              </div>
            </div>
          ))
        }
      </div>
    </>
  );
}

export default Home;