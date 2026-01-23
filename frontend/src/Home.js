import React, { useEffect, useState } from 'react';
import './App.css';
import { infinite } from 'ionicons/icons';
import background from './background.jpg';
import { Typewriter, Cursor } from 'react-simple-typewriter';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBIcon } from 'mdb-react-ui-kit';
import Axios from 'axios';

function Home() {
  const [bestUsers, setBestUsers] = useState([]);

  useEffect(() => {
    // Dohvatamo samo scoreboard za početnu
    Axios.get("https://localhost:7248/api/User/Scoreboard")
      .then(res => {
        setBestUsers(res.data.slice(0, 4));
      })
      .catch(err => console.error('Greška pri dohvatanju scoreboard-a:', err));
  }, []);

  return (
    <>
      <div className='background'>
        <img className='background-img' src={background} alt="Background" />
        <div className='animation-text'>
          <h2>
            <Typewriter 
              words={['Organizuj se.', 'Budi produktivan.', 'Pobedi na listi!']} 
              loop={infinite} 
              typeSpeed={50} 
              deleteSpeed={50} 
            />
            <Cursor />
          </h2>
        </div>
      </div>

      <MDBContainer className='mt-5 pb-5'>
        <h2 className='text-center mb-5' style={{ fontWeight: 'bold' }}>
          🏆 Top Korisnici (Redis)
        </h2>
        
        <MDBRow className="justify-content-center">
          {bestUsers.length > 0 ? (
            bestUsers.map((user, index) => (
              <MDBCol md="3" key={index} className="mb-3">
                <MDBCard className='text-center shadow-2 border-0' style={{ borderRadius: '20px' }}>
                  <MDBCardBody>
                    <MDBIcon fas icon="user-circle" size="3x" className="mb-2 text-dark" />
                    <h5>@{user.username}</h5>
                    <div className='badge bg-warning text-dark' style={{ fontSize: '0.9rem' }}>
                      {user.points} pts
                    </div>
                    <p className='small text-muted mt-2 mb-0'>Rank #{index + 1}</p>
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            ))
          ) : (
            <p className="text-center text-muted">Učitavanje rang liste...</p>
          )}
        </MDBRow>
      </MDBContainer>
    </>
  );
}

export default Home;