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
    isAdmin: false,
    profilePicture: ''
  });
  
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await API.get('/User/GetUser');
        setUser(response.data);
        
        const lbResponse = await API.get('/Task/Leaderboard');
        const myData = lbResponse.data.find(x => x.key === response.data.username);
        if (myData) setScore(myData.value);
        
      } catch (error) {
        console.error('Greska pri dohvatanju podataka:', error);
      }
    };

    fetchMyProfile();
  }, []);

  const memberSince = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('sr-RS') 
    : 'Ucitavanje...';

  return (
    <div className="profile-wrapper">
      <MDBContainer className="py-5">
        <MDBRow className="justify-content-center">
          <MDBCol lg="9" xl="8">
            <MDBCard className="custom-card overflow-hidden border-0 shadow-lg">
              <MDBRow className="g-0">
                {}
                <MDBCol md="4" className="gradient-custom-dark text-center text-white d-flex flex-column align-items-center justify-content-center p-4">
                  <MDBCardImage 
                    src={
                      user.profilePicture && user.profilePicture !== 'default.png' 
                        ? `https://localhost:7248/uploads/${user.profilePicture}` 
                        : profileIcon
                    }
                    alt="Avatar" 
                    className="mb-3 profile-avatar"
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

                 
                  <div className="score-box">
                    <small className="score-label">Ukupno poena</small>
                    <span className="score-value">{score}</span>
                  </div>
                </MDBCol>

               
                <MDBCol md="8">
                  <MDBCardBody className="p-4 p-lg-5">
                    <div className="header profile-section-header">
                      <div className="text small-header">Informacije</div>
                      <div className="underline short-underline"></div>
                    </div>

                    <MDBRow className="pt-1">
                      <MDBCol size="6" className="mb-4">
                        <MDBTypography tag="h6" className="info-label">Email</MDBTypography>
                        <MDBCardText className="text-muted">{user.email || 'Učitavanje...'}</MDBCardText>
                      </MDBCol>
                      <MDBCol size="6" className="mb-4">
                        <MDBTypography tag="h6" className="info-label">Username</MDBTypography>
                        <MDBCardText className="text-primary-custom">@{user.username}</MDBCardText>
                      </MDBCol>
                    </MDBRow>

                    <div className="header profile-section-header">
                      <div className="text small-header">Licni podaci</div>
                      <div className="underline short-underline"></div>
                    </div>

                    <MDBRow className="pt-1">
                      <MDBCol size="6" className="mb-4">
                        <MDBTypography tag="h6" className="info-label">Ime</MDBTypography>
                        <MDBCardText className="text-muted">{user.name || '/'}</MDBCardText>
                      </MDBCol>
                      <MDBCol size="6" className="mb-4">
                        <MDBTypography tag="h6" className="info-label">Prezime</MDBTypography>
                        <MDBCardText className="text-muted">{user.lastName || '/'}</MDBCardText>
                      </MDBCol>
                    </MDBRow>

                    <div className="profile-footer">
                       <small className="text-muted">Status: Aktivan</small>
                       <small className="text-muted italic">Clan od: {memberSince}</small>
                    </div>
                  </MDBCardBody>
                </MDBCol>
              </MDBRow>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <ToastContainer position="bottom-right"  theme="dark"  limit={1} autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick pauseOnHover closeButton={false}  />
    </div>
  );
}

export default Profile;