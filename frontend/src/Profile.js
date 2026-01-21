import { ToastContainer, toast } from 'react-toastify';
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBTypography } from 'mdb-react-ui-kit';
import './Profile.css';
import React, { useEffect, useState } from 'react';
import profileIcon from './profile-icon.png'; // Proveri da li je putanja ispravna

function Profile() {
  const [user, setUser] = useState({
    email: '',
    username: '',
    name: '',
    lastName: '',
    profilePicture: ''
  });

  // URL tvog novog backenda na portu 7248
  const baseUrl = "https://localhost:7248/api/User";

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await fetch(`${baseUrl}/GetUser`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include', // Ovo povlači JWT iz kolačića
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error("Niste ulogovani ili server nije dostupan.");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Greška pri dohvatanju profila:', error);
        toast.error("Sesija je istekla. Molimo prijavite se ponovo.");
      }
    };

    fetchMyProfile();
  }, []);

  return (
    <>
      <section className="vh-100" style={{ backgroundColor: '#f4f5f7' }}>
        <MDBContainer className="py-5 h-100">
          <MDBRow className="justify-content-center align-items-center h-100">
            <MDBCol lg="8" className="mb-4 mb-lg-0">
              <MDBCard className="mb-3" style={{ borderRadius: '.5rem' }}>
                <MDBRow className="g-0">
                  <MDBCol md="4" className="gradient-custom-dark text-center text-white"
                    style={{ borderTopLeftRadius: '.5rem', borderBottomLeftRadius: '.5rem', backgroundColor: '#2B3035' }}>
                    <MDBCardImage 
                      src={profileIcon}
                      alt="Avatar" 
                      className="my-5" 
                      style={{ width: '100px', borderRadius: '50%' }} 
                      fluid 
                    />
                    <MDBTypography tag="h5">{user.name} {user.lastName}</MDBTypography>
                    <MDBCardText>Korisnik sistema</MDBCardText>
                  </MDBCol>
                  <MDBCol md="8">
                    <MDBCardBody className="p-4">
                      <MDBTypography tag="h6">Informacije o nalogu</MDBTypography>
                      <hr className="mt-0 mb-4" />
                      <MDBRow className="pt-1">
                        <MDBCol size="6" className="mb-3">
                          <MDBTypography tag="h6">Email</MDBTypography>
                          <MDBCardText className="text-muted">{user.email}</MDBCardText>
                        </MDBCol>
                        <MDBCol size="6" className="mb-3">
                          <MDBTypography tag="h6">Korisničko ime</MDBTypography>
                          <MDBCardText className="text-muted">@{user.username}</MDBCardText>
                        </MDBCol>
                      </MDBRow>

                      <MDBTypography tag="h6">Lični podaci</MDBTypography>
                      <hr className="mt-0 mb-4" />
                      <MDBRow className="pt-1">
                        <MDBCol size="6" className="mb-3">
                          <MDBTypography tag="h6">Ime</MDBTypography>
                          <MDBCardText className="text-muted">{user.name}</MDBCardText>
                        </MDBCol>
                        <MDBCol size="6" className="mb-3">
                          <MDBTypography tag="h6">Prezime</MDBTypography>
                          <MDBCardText className="text-muted">{user.lastName}</MDBCardText>
                        </MDBCol>
                      </MDBRow>

                      <div className="d-flex justify-content-start">
                         <MDBCardText className="text-muted">Član od: {new Date().toLocaleDateString()}</MDBCardText>
                      </div>
                    </MDBCardBody>
                  </MDBCol>
                </MDBRow>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>
      <ToastContainer />
    </>
  );
}

export default Profile;