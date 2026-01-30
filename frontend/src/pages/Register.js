import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import Axios from '../api';
import '../styles/Register.css';
import '../styles/App.css'; // Dodajemo zbog btn-dark-custom i ostalih klasa


function Register() {
  const [data, setData] = useState({
    name: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    repeatedPassword: '',
    profilePicture: 'default.png'
  });

  const navigate = useNavigate();
  const url = 'https://localhost:7248/api/User/Register';

  const handleInputChange = (e) => {
    setData({ ...data, [e.target.id]: e.target.value });
  };

  const submit = (e) => {
    e.preventDefault();

    if (data.password !== data.repeatedPassword) {
      toast.error("Lozinke se ne podudaraju!");
      return;
    }

    const payload = {
      name: data.name,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      password: data.password,
      repeatedPassword: data.repeatedPassword,
      profilePicture: data.profilePicture
    };

    Axios.post(url, payload, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    })
      .then((res) => {
        toast.success("Uspešna registracija! Preusmeravanje...");
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch((error) => {
        const errorMsg = error.response?.data || "Greška pri registraciji";
        toast.error(typeof errorMsg === 'string' ? errorMsg : "Neispravni podaci.");
      });
  };

  return (
    <div className='background-radial-gradient'>
      <MDBContainer fluid className="p-4">
        <MDBRow className="d-flex justify-content-center align-items-center min-vh-100">
          
          <MDBCol md="6" className="text-center text-md-start d-flex flex-column justify-content-center">
            <h1 className="my-5 display-3 fw-bold ls-tight px-3" style={{ color: '#555' }}>
              Pridruži se <br />
              <span style={{ color: '#2B3035' }}>Organizuj se lako</span>
            </h1>
            <p className="px-3 text-muted">
              Dobrodošli u TodoApp. Postanite deo zajednice koja efikasno upravlja svojim vremenom i zadacima.
            </p>
          </MDBCol>

          <MDBCol md="6" style={{ maxWidth: '500px' }}>
            <MDBCard className="bg-glass shadow-5">
              <MDBCardBody className="p-5">
                {/* Naslov sekcije unutar kartice */}
                <div className='header mb-4' style={{alignItems: 'flex-start'}}>
                    <div className='text' style={{fontSize: '28px'}}>Registracija</div>
                    <div className='underline' style={{margin: '0', width: '40px'}}></div>
                </div>

                <form onSubmit={submit}>
                  <MDBRow>
                    <MDBCol col="6">
                      <MDBInput onChange={handleInputChange} id="name" label="Ime" type="text" required wrapperClass="mb-4" />
                    </MDBCol>
                    <MDBCol col="6">
                      <MDBInput onChange={handleInputChange} id="lastName" label="Prezime" type="text" required wrapperClass="mb-4" />
                    </MDBCol>
                  </MDBRow>
                  
                  <MDBInput onChange={handleInputChange} id="username" label="Korisničko ime" type="text" required wrapperClass="mb-4" />
                  <MDBInput onChange={handleInputChange} id="email" label="Email adresa" type="email" required wrapperClass="mb-4" />
                  <MDBInput onChange={handleInputChange} id="password" label="Lozinka" type="password" required wrapperClass="mb-4" />
                  <MDBInput onChange={handleInputChange} id="repeatedPassword" label="Ponovite lozinku" type="password" required wrapperClass="mb-4" />

                  <button type="submit" className="btn-dark-custom w-100 mb-4 py-2">
                    KREIRAJ NALOG
                  </button>

                  <div className="text-center">
                    <p className="small">Već imate nalog? <a href="/login" className="fw-bold" style={{ color: '#2B3035' }}>Prijavi se</a></p>
                  </div>
                </form>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Register;