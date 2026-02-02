import { ToastContainer } from 'react-toastify';
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBTypography, MDBBadge } from 'mdb-react-ui-kit';
import '../styles/Profile.css';
import '../styles/App.css'; 
import React, { useEffect, useState } from 'react';
import profileIcon from '../assets/profile-icon.png';
import API from '../api';

function Profile() {
  const [user, setUser] = useState({
    email: '',
    username: '',
    name: '',
    lastName: '',
    createdAt: null,
    isAdmin: false
  });
  
  const [score, setScore] = useState(0); // NOVO: Poeni iz Redisa

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await API.get('/User/GetUser');
        setUser(response.data);
        
        // NOVO: Dohvatanje poena sa Leaderboard-a
        const lbResponse = await API.get('/Task/Leaderboard');
        const myData = lbResponse.data.find(x => x.key === response.data.username);
        if (myData) setScore(myData.value);
        
      } catch (error) {
        console.error('Greška pri dohvatanju podataka:', error);
      }
    };

    fetchMyProfile();
  }, []);

  const memberSince = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('sr-RS') 
    : 'Učitavanje...';

  return (
    <div className="profile-wrapper">
      <MDBContainer className="py-5">
        <MDBRow className="justify-content-center">
          <MDBCol lg="9" xl="8">
            <MDBCard className="custom-card overflow-hidden border-0 shadow-lg">
              <MDBRow className="g-0">
                {/* Leva strana */}
                <MDBCol md="4" className="gradient-custom-dark text-center text-white d-flex flex-column align-items-center justify-content-center p-4">
                  <MDBCardImage 
                          src={
                          user.profilePicture && user.profilePicture !== 'default.png' 
                            ? `https://localhost:7248/uploads/${user.profilePicture}` 
                            : profileIcon
                        }
                        alt="Avatar" 
                        className="mb-3 profile-avatar shadow"
                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                  <MDBTypography tag="h4" className="fw-bold mb-1">
                    {user.name && user.lastName ? `${user.name} ${user.lastName}` : user.username}
                  </MDBTypography>
                  
                  <div className="mb-3">
                    {user.isAdmin ? (
                        <MDBBadge pill color='warning' className='text-dark'>Administrator</MDBBadge>
                    ) : (
                        <MDBBadge pill color='light' className='text-dark'>Korisnik</MDBBadge>
                    )}
                  </div>

                  {/* NOVO: Prikaz poena direktno iz Redisa */}
                  <div className="bg-white text-dark rounded-3 px-3 py-2 shadow-sm">
                    <small className="d-block text-uppercase fw-bold" style={{fontSize: '10px'}}>Ukupno poena</small>
                    <span className="h4 fw-bold text-primary">{score}</span>
                  </div>
                </MDBCol>

                {/* Desna strana */}
                <MDBCol md="8">
                  <MDBCardBody className="p-4 p-lg-5">
                    <div className="d-flex align-items-center mb-4">
                        <div className="header m-0" style={{alignItems: 'flex-start'}}>
                            <div className="text" style={{fontSize: '24px'}}>Informacije</div>
                            <div className="underline" style={{margin: '0', width: '40px'}}></div>
                        </div>
                    </div>

                    <MDBRow className="pt-1">
                      <MDBCol size="6" className="mb-4">
                        <MDBTypography tag="h6" className="fw-bold text-uppercase" style={{fontSize: '12px'}}>Email</MDBTypography>
                        <MDBCardText className="text-muted">{user.email || 'Učitavanje...'}</MDBCardText>
                      </MDBCol>
                      <MDBCol size="6" className="mb-4">
                        <MDBTypography tag="h6" className="fw-bold text-uppercase" style={{fontSize: '12px'}}>Username</MDBTypography>
                        <MDBCardText className="text-primary fw-bold">@{user.username}</MDBCardText>
                      </MDBCol>
                    </MDBRow>

                    <div className="header m-0 mb-4" style={{alignItems: 'flex-start'}}>
                        <div className="text" style={{fontSize: '22px'}}>Lični podaci</div>
                        <div className="underline" style={{margin: '0', width: '30px'}}></div>
                    </div>

                    <MDBRow className="pt-1">
                      <MDBCol size="6" className="mb-4">
                        <MDBTypography tag="h6" className="fw-bold text-uppercase" style={{fontSize: '12px'}}>Ime</MDBTypography>
                        <MDBCardText className="text-muted">{user.name || '/'}</MDBCardText>
                      </MDBCol>
                      <MDBCol size="6" className="mb-4">
                        <MDBTypography tag="h6" className="fw-bold text-uppercase" style={{fontSize: '12px'}}>Prezime</MDBTypography>
                        <MDBCardText className="text-muted">{user.lastName || '/'}</MDBCardText>
                      </MDBCol>
                    </MDBRow>

                    <div className="mt-4 pt-2 border-top d-flex justify-content-between">
                       <small className="text-muted">Status: Aktivan</small>
                       <small className="text-muted italic">Član od: {memberSince}</small>
                    </div>
                  </MDBCardBody>
                </MDBCol>
              </MDBRow>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default Profile;