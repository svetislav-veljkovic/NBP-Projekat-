import React, { useEffect, useState } from 'react';
import '../styles/App.css';
import background from '../assets/background.jpg';
import { Typewriter, Cursor } from 'react-simple-typewriter';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBIcon } from 'mdb-react-ui-kit';
import Axios from 'axios';

function Home() {
  const [bestUsers, setBestUsers] = useState([]);

  useEffect(() => {
    // Dohvatanje podataka sa Redis leaderboard-a
    Axios.get("https://localhost:7248/api/Task/Leaderboard")
      .then(res => {
        // Uzimamo prva 4 korisnika za prikaz na početnoj
        setBestUsers(res.data.slice(0, 4));
      })
      .catch(err => console.error('Greška pri dohvatanju ranga:', err));
  }, []);

  return (
    <>
      <div className='background'>
        <img className='background-img' src={background} alt="Background" />
        <div className='animation-text'>
          <h2>
            <Typewriter 
              words={['Organizuj se.', 'Budi produktivan.', 'Pobedi na listi!']} 
              loop={true} // Koristimo true umesto infinite varijable
              typeSpeed={50} 
              deleteSpeed={50} 
            />
            <Cursor />
          </h2>
        </div>
      </div>

      <MDBContainer className='mt-5 pb-5'>
        {/* Naslov sekcije sa našim stilom */}
        <div className='header mb-5'>
          <div className='text'>🏆 Top Korisnici</div>
          <div className='underline'></div>
        </div>
        
        <MDBRow className="justify-content-center">
          {bestUsers.length > 0 ? (
            bestUsers.map((user, index) => (
              <MDBCol md="3" key={index} className="mb-4">
                {/* Koristimo custom-card za hover efekat */}
                <MDBCard className='text-center custom-card border-0'>
                  <MDBCardBody className="p-4">
                    <MDBIcon fas icon="user-circle" size="3x" className="mb-3 text-dark" />
                    <h5 className="fw-bold">@{user.key}</h5>
                    <div className='badge bg-warning text-dark px-3 py-2' style={{ fontSize: '0.9rem', borderRadius: '10px' }}>
                      {user.value} pts
                    </div>
                    <p className='small text-muted mt-3 mb-0 fw-bold'>Rank #{index + 1}</p>
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            ))
          ) : (
            <div className="text-center">
              <div className="spinner-border text-dark" role="status">
                <span className="visually-hidden">Učitavanje...</span>
              </div>
              <p className="mt-2 text-muted">Učitavanje rang liste sa Redisa...</p>
            </div>
          )}
        </MDBRow>
      </MDBContainer>
    </>
  );
}

export default Home;