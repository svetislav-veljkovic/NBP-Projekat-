import React, { useEffect, useState } from 'react';
import '../styles/App.css';
import background from '../assets/background.jpg';
import { Typewriter, Cursor } from 'react-simple-typewriter';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBIcon } from 'mdb-react-ui-kit';
import API from '../api';

function Home() {
  const [bestUsers, setBestUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = (isInitialLoad = false) => {
      if (isInitialLoad) setLoading(true);
      API.get("/Task/Leaderboard")
        .then(res => {
          setBestUsers(res.data.slice(0, 4));
        })
        .catch(err => console.error('Greška:', err))
        .finally(() => {
          if (isInitialLoad) setLoading(false);
        });
    };

    fetchLeaders(true);
    const interval = setInterval(() => fetchLeaders(false), 60000);

    return () => clearInterval(interval);
  }, []);

  const getRankColor = (index) => {
    switch(index) {
      case 0: return '#FFD700'; 
      case 1: return '#C0C0C0'; 
      case 2: return '#CD7F32'; 
      default: return '#2B3035';
    }
  };

  return (
    <>
      <div className='background'>
        <img className='background-img' src={background} alt="Background" />
        <div className='animation-text'>
          <h2>
            <Typewriter 
              words={['Organizuj se.', 'Budi produktivan.', 'Pobedi na listi!']} 
              loop={true} 
              typeSpeed={50} 
              deleteSpeed={50} 
            />
            <Cursor />
          </h2>
        </div>
      </div>

      <MDBContainer className='mt-5 pb-5'>
        <div className='header mb-5'>
          <div className='text'>🏆 Top Korisnici</div>
          <div className='underline'></div>
        </div>
        
        <MDBRow className="justify-content-center">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Ucitavanje najboljih korisnika ...</p>
            </div>
          ) : bestUsers.length > 0 ? (
            bestUsers.map((user, index) => (
              <MDBCol md="3" sm="6" key={index} className="mb-4">
                <MDBCard 
                  className={`text-center custom-card border-0 shadow-sm h-100 leaderboard-card-main ${index === 0 ? 'top-user-scale' : ''}`}
                >
                  <MDBCardBody className="p-4">
                    <MDBIcon 
                      fas 
                      icon="crown" 
                      size="2x" 
                      className="mb-3" 
                      style={{ color: getRankColor(index) }} 
                    />
                    <h5 className="fw-bold mb-1">@{user.key}</h5>
                    <p className='text-muted small mb-3'>Rank #{index + 1}</p>
                    
                    <div 
                      className='points-badge-home' 
                      style={{ border: `1px solid ${getRankColor(index)}` }}
                    >
                      {user.value} <small>pts</small>
                    </div>
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            ))
          ) : (
            <div className="text-center py-5">
              <MDBIcon far icon="frown" size="3x" className="text-muted mb-3" />
              <p className='text-muted'>Jos uvek nema podataka na rang listi. Budi prvi!</p>
            </div>
          )}
        </MDBRow>
      </MDBContainer>
    </>
  );
}

export default Home;