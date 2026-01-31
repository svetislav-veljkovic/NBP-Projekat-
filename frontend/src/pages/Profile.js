import { ToastContainer } from 'react-toastify';
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBTypography } from 'mdb-react-ui-kit';
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
    createdAt: null
  });

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        // API instanca već ima https://localhost:7248/api i withCredentials
        const response = await API.get('/User/GetUser');
        setUser(response.data);
      } catch (error) {
        console.error('Greška pri dohvatanju profila:', error);
      }
    };

    fetchMyProfile();
  }, []);

  // Formatiranje datuma - koristi datum sa servera ili današnji datum kao fallback
  const memberSince = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('sr-RS') 
    : new Date().toLocaleDateString('sr-RS');

  return (
    <div className="profile-wrapper">
      <MDBContainer className="py-5">
        <MDBRow className="justify-content-center">
          <MDBCol lg="9" xl="8">
            <MDBCard className="custom-card overflow-hidden">
              <MDBRow className="g-0">
                {/* Leva strana - Vizuelni identitet */}
                <MDBCol md="4" className="gradient-custom-dark text-center text-white d-flex flex-column align-items-center justify-content-center p-4">
                  <MDBCardImage 
                    src={profileIcon}
                    alt="Avatar" 
                    className="mb-3 profile-avatar"
                  />
                  <MDBTypography tag="h4" className="fw-bold">
                    {user.name && user.lastName ? `${user.name} ${user.lastName}` : user.username}
                  </MDBTypography>
                  <MDBCardText className="opacity-75">Korisnik sistema</MDBCardText>
                </MDBCol>

                {/* Desna strana - Podaci */}
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
                        <MDBTypography tag="h6" className="fw-bold text-uppercase">Email</MDBTypography>
                        <MDBCardText className="text-muted">{user.email || 'Učitavanje...'}</MDBCardText>
                      </MDBCol>
                      <MDBCol size="6" className="mb-4">
                        <MDBTypography tag="h6" className="fw-bold text-uppercase">Username</MDBTypography>
                        <MDBCardText className="text-muted text-primary">@{user.username}</MDBCardText>
                      </MDBCol>
                    </MDBRow>

                    <div className="header m-0 mb-4" style={{alignItems: 'flex-start'}}>
                        <div className="text" style={{fontSize: '24px'}}>Lični podaci</div>
                        <div className="underline" style={{margin: '0', width: '40px'}}></div>
                    </div>

                    <MDBRow className="pt-1">
                      <MDBCol size="6" className="mb-4">
                        <MDBTypography tag="h6" className="fw-bold text-uppercase">Ime</MDBTypography>
                        <MDBCardText className="text-muted">{user.name || 'Nije uneto'}</MDBCardText>
                      </MDBCol>
                      <MDBCol size="6" className="mb-4">
                        <MDBTypography tag="h6" className="fw-bold text-uppercase">Prezime</MDBTypography>
                        <MDBCardText className="text-muted">{user.lastName || 'Nije uneto'}</MDBCardText>
                      </MDBCol>
                    </MDBRow>

                    <div className="mt-4 pt-2 border-top">
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