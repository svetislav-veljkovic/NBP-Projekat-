import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput } from 'mdb-react-ui-kit';
import { toast, ToastContainer } from 'react-toastify';
import Axios from 'axios';
import '../styles/Register.css';
import '../styles/App.css'; // Dodajemo i App.css zbog .header klase
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Edit() {
  const navigate = useNavigate();
  const url = "https://localhost:7248/api/User/Edit";

  const [user, setUser] = useState({
    name: '',
    lastName: '',
    username: '',
    email: '',
    profilePicture: 'default.png'
  });

  useEffect(() => {
    Axios.get("https://localhost:7248/api/User/GetUser", { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(err => toast.error("Greška pri učitavanju podataka"));
  }, []);

  const submit = (e) => {
    e.preventDefault();
    Axios.put(url, user, { withCredentials: true })
      .then(() => {
        toast.success("Profil uspešno ažuriran!");
        setTimeout(() => navigate('/profile'), 2000);
      })
      .catch(err => toast.error("Greška pri čuvanju"));
  };

  return (
    <div className='background-radial-gradient'>
      <MDBContainer fluid className='p-4'>
        <MDBRow className='justify-content-center'>
          <MDBCol md='6' lg='5'>
            <MDBCard className='bg-glass shadow-5'>
              <MDBCardBody className='p-5'>
                
                {/* Usklađen naslov sa ostatkom aplikacije */}
                <div className='header mb-5'>
                    <div className='text'>Izmeni profil</div>
                    <div className='underline'></div>
                </div>

                <form onSubmit={submit}>
                  <MDBInput 
                    label='Ime' 
                    type='text' 
                    value={user.name} 
                    onChange={(e) => setUser({...user, name: e.target.value})} 
                    wrapperClass='mb-4' 
                  />
                  <MDBInput 
                    label='Prezime' 
                    type='text' 
                    value={user.lastName} 
                    onChange={(e) => setUser({...user, lastName: e.target.value})} 
                    wrapperClass='mb-4' 
                  />
                  <MDBInput 
                    label='Korisničko ime (nije promenljivo)' 
                    type='text' 
                    value={user.username} 
                    readOnly 
                    wrapperClass='mb-4' 
                    style={{backgroundColor: '#e9ecef'}}
                  />
                  
                  <Button 
                    type='submit' 
                    className='btn-dark-custom w-100 mt-2'
                  >
                    SAČUVAJ IZMENE
                  </Button>
                </form>

              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default Edit;