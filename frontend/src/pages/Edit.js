import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput } from 'mdb-react-ui-kit';
import { toast, ToastContainer } from 'react-toastify';
import API from '../api'; // Promenjeno na API
import '../styles/Register.css';
import '../styles/App.css'; 
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Edit() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: '',
    lastName: '',
    username: '',
    email: '',
    profilePicture: 'default.png'
  });

  useEffect(() => {
    // Koristimo relativnu putanju - API instanca dodaje baseURL
    API.get("/User/GetUser")
      .then(res => setUser(res.data))
      .catch(err => toast.error("Greška pri učitavanju podataka"));
  }, []);

  const submit = (e) => {
    e.preventDefault();
    // PUT zahtev na relativnu putanju /User/Edit
    API.put("/User/Edit", user)
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