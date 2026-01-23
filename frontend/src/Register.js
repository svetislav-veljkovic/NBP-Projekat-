import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import './Register.css';
import { Button } from 'react-bootstrap';

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

    // 1. Provera na frontendu (da ne šaljemo džabe zahtev ako su različite)
    if (data.password !== data.repeatedPassword) {
      toast.error("Lozinke se ne podudaraju na frontendu!");
      return;
    }

    // 2. PAYLOAD - Sadrži SVA polja koja UserRegisterDTO u C# očekuje
    const payload = {
      name: data.name,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      password: data.password,
      repeatedPassword: data.repeatedPassword, // SADA JE OVDE - Backend ovo traži za proveru
      profilePicture: data.profilePicture
    };

    // 3. Axios poziv ka backendu
    Axios.post(url, payload, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    })
      .then((res) => {
        toast.success("Uspešna registracija!");
        // Prebacujemo na login nakon 2 sekunde
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch((error) => {
        console.error("Server Error Details:", error.response);
        // Hvatanje specifične poruke sa backenda (npr. "User already exists")
        const errorMsg = error.response?.data || "Greška pri registraciji";
        toast.error(typeof errorMsg === 'string' ? errorMsg : "Neispravni podaci.");
      });
  };

  return (
    <>
      <form onSubmit={submit}>
        <MDBContainer fluid className="p-4 background-radial-gradient" style={{ minHeight: '100vh' }}>
          <MDBRow className="d-flex justify-content-center align-items-center">
            
            <MDBCol md="6" className="text-center text-md-start d-flex flex-column justify-content-center">
              <h1 className="my-5 display-3 fw-bold ls-tight px-3" style={{ color: '#555' }}>
                Pridruži se <br />
                <span style={{ color: '#2B3035' }}>Organizuj obaveze lako</span>
              </h1>
              <p className="px-3" style={{ color: 'hsl(217, 10%, 50.8%)' }}>
                Dobrodošli u TodoApp. Registrujte se i počnite sa korišćenjem sistema.
              </p>
            </MDBCol>

            <MDBCol md="6" style={{ maxWidth: '500px' }}>
              <MDBCard className="bg-glass shadow-5">
                <MDBCardBody className="p-5">
                  <MDBRow>
                    <MDBCol col="6">
                      <MDBInput onChange={handleInputChange} id="name" label="Ime" type="text" required wrapperClass="mb-4" />
                    </MDBCol>
                    <MDBCol col="6">
                      <MDBInput onChange={handleInputChange} id="lastName" label="Prezime" type="text" required wrapperClass="mb-4" />
                    </MDBCol>
                  </MDBRow>
                  
                  <MDBInput onChange={handleInputChange} id="username" label="Korisničko ime" type="text" required wrapperClass="mb-4" />
                  <MDBInput onChange={handleInputChange} id="email" label="Email" type="email" required wrapperClass="mb-4" />
                  <MDBInput onChange={handleInputChange} id="password" label="Lozinka" type="password" required wrapperClass="mb-4" />
                  <MDBInput onChange={handleInputChange} id="repeatedPassword" label="Ponovi lozinku" type="password" required wrapperClass="mb-4" />

                  <Button style={{ backgroundColor: '#2B3035', border: 'none' }} type="submit" className="w-100 mb-4">
                    Registruj se
                  </Button>

                  <div className="text-center">
                    <p>Već imate nalog? <a href="/login" style={{ color: '#2B3035', fontWeight: 'bold' }}>Prijavi se</a></p>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default Register;