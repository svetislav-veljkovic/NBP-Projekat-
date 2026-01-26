import { ToastContainer, toast } from 'react-toastify';
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBTypography } from 'mdb-react-ui-kit';
import '../styles/Profile.css';
import '../styles/App.css'; // Dodajemo zbog custom-card klase
import React, { useEffect, useState } from 'react';
import profileIcon from '../assets/profile-icon.png';

function Profile() {
  const [user, setUser] = useState({
    email: '',
    username: '',
    name: '',
    lastName: '',
    profilePicture: ''
  });

  const baseUrl = "https://localhost:7248/api/User";

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await fetch(`${baseUrl}/GetUser`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error("Niste ulogovani.");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Greška:', error);
        toast.error("Sesija je istekla. Prijavite se ponovo.");
      }
    };

    fetchMyProfile();
  }, []);

  return (
    <div className="profile-wrapper">
      <MDBContainer className="py-5">
        <MDBRow className="justify-content-center">
          <MDBCol lg="9" xl="8">
            <MDBCard className="custom-card overflow-hidden">
              <MDBRow className="g-0">
                {/* Leva strana - Tamna pozadina sa avatarom */}
                <MDBCol md="4" className="gradient-custom-dark text-center text-white d-flex flex-column align-items-center justify-content-center p-4">
                  <MDBCardImage 
                    src={profileIcon}
                    alt="Avatar" 
                    className="mb-3 profile-avatar"
                  />
                  <MDBTypography tag="h4" className="fw-bold">{user.name} {user.lastName}</MDBTypography>
                  <MDBCardText className="opacity-75">Korisnik sistema</MDBCardText>
                </MDBCol>

                {/* Desna strana - Detalji */}
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

                    <div className="mt-4 pt-2 border-top d-flex justify-content-between align-items-center">
                       <small className="text-muted italic">Član od: {new Date().toLocaleDateString('sr-RS')}</small>
                       <button 
                        className="btn btn-outline-dark btn-sm" 
                        onClick={() => window.location.href='/editprofile'}
                       >
                         Izmeni profil
                       </button>
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