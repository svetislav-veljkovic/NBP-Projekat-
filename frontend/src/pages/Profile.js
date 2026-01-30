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
    createdAt: null // Dodato polje za datum registracije
  });

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await API.get('/User/GetUser');
        setUser(response.data);
      } catch (error) {
        console.error('Greška pri dohvatanju profila:', error);
      }
    };

    fetchMyProfile();
  }, []);

  // Formatiranje datuma (ako backend šalje datum, ako ne, ostaje fallback)
  const memberSince = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('sr-RS') 
    : '30. 1. 2026.'; // Fallback datum sa tvoje slike

  return (
    <div className="profile-wrapper">
      <MDBContainer className="py-5">
        <MDBRow className="justify-content-center">
          <MDBCol lg="9" xl="8">
            <MDBCard className="custom-card overflow-hidden">
              <MDBRow className="g-0">
                {/* Leva strana */}
                <MDBCol md="4" className="gradient-custom-dark text-center text-white d-flex flex-column align-items-center justify-content-center p-4">
                  <MDBCardImage 
                    src={profileIcon}
                    alt="Avatar" 
                    className="mb-3 profile-avatar"
                  />
                  <MDBTypography tag="h4" className="fw-bold">
                    {user.name} {user.lastName}
                  </MDBTypography>
                  <MDBCardText className="opacity-75">Korisnik sistema</MDBCardText>
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
                        <MDBTypography tag="h6" className="fw-bold text-uppercase">Email</MDBTypography>
                        <MDBCardText className="text-muted">{user.email}</MDBCardText>
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

                    {/* Footer kartice - SAMO DATUM, dugme izbačeno */}
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