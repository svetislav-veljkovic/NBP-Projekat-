import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput } from 'mdb-react-ui-kit';
import { toast, ToastContainer } from 'react-toastify';
import Axios from 'axios';
import './Register.css';
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
    // Prvo dobavljamo trenutne podatke da popunimo formu
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
    <>
      <form onSubmit={submit}>
        <MDBContainer fluid className='p-4 background-radial-gradient'>
          <MDBRow className='justify-content-center'>
            <MDBCol md='6'>
              <MDBCard className='bg-glass'>
                <MDBCardBody className='p-5'>
                  <h2 className="mb-4">Izmeni profil</h2>
                  <MDBInput label='Ime' type='text' value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} wrapperClass='mb-4' />
                  <MDBInput label='Prezime' type='text' value={user.lastName} onChange={(e) => setUser({...user, lastName: e.target.value})} wrapperClass='mb-4' />
                  <MDBInput label='Korisničko ime' type='text' value={user.username} readOnly wrapperClass='mb-4' />
                  <Button type='submit' className='w-100' style={{backgroundColor: '#2B3035', border: 'none'}}>Sačuvaj izmene</Button>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </form>
      <ToastContainer />
    </>
  );
}

export default Edit;