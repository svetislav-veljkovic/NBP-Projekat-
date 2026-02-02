import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/Register.css';
import '../styles/App.css';
import { Spinner } from 'react-bootstrap';

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

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setData({ ...data, [e.target.id]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (data.password !== data.repeatedPassword) {
      toast.error("Lozinke se ne podudaraju!");
      return;
    }

    const payload = {
      ...data,
      username: data.username.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
    };

    setIsLoading(true);
    try {
      await API.post('/User/Register', payload);
      toast.success("Uspesna registracija! Preusmeravanje na prijavu...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data || "Greska pri registraciji";
      toast.error(typeof errorMsg === 'string' ? errorMsg : "Proverite unete podatke.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='background-radial-gradient'>
      <MDBContainer fluid className="p-4">
        <MDBRow className="d-flex justify-content-center align-items-center min-vh-100">
          
          <MDBCol md="6" className="text-center text-md-start d-flex flex-column justify-content-center d-none d-md-flex">
            <h1 className="my-5 display-3 fw-bold ls-tight px-3 register-hero-title">
              Pridruži se <br />
              <span className="brand-accent-yellow">Organizuj se lako</span>
            </h1>
            <p className="px-3 text-muted hero-description">
              Postani deo zajednice koja efikasno upravlja svojim vremenom. 
              Zavrsi zadatke, skupljaj poene i osvoji vrh rang liste!
            </p>
          </MDBCol>

          <MDBCol md="6" className="register-card-column">
            <MDBCard className="bg-glass shadow-5">
              <MDBCardBody className="p-5">
                <div className='header profile-section-header mb-4'>
                    <div className='text small-header'>Registracija</div>
                    <div className='underline short-underline'></div>
                </div>

                <form onSubmit={submit}>
                  <MDBRow>
                    <MDBCol col="6">
                      <MDBInput onChange={handleInputChange} id="name" label="Ime" type="text" required wrapperClass="mb-4" disabled={isLoading} />
                    </MDBCol>
                    <MDBCol col="6">
                      <MDBInput onChange={handleInputChange} id="lastName" label="Prezime" type="text" required wrapperClass="mb-4" disabled={isLoading} />
                    </MDBCol>
                  </MDBRow>
                  
                  <MDBInput onChange={handleInputChange} id="username" label="Korisnicko ime" type="text" required wrapperClass="mb-4" disabled={isLoading} />
                  <MDBInput onChange={handleInputChange} id="email" label="Email adresa" type="email" required wrapperClass="mb-4" disabled={isLoading} />
                  <MDBInput onChange={handleInputChange} id="password" label="Lozinka" type="password" required wrapperClass="mb-4" disabled={isLoading} />
                  <MDBInput onChange={handleInputChange} id="repeatedPassword" label="Ponovite lozinku" type="password" required wrapperClass="mb-4" disabled={isLoading} />

                  <button 
                    type="submit" 
                    className="sign-in mb-4 d-flex justify-content-center align-items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner size="sm" className="me-2" /> : 'KREIRAJ NALOG'}
                  </button>

                  <div className="text-center">
                    <p className="small text-muted">
                        Vec imate nalog? <span className="login-link" onClick={() => navigate('/login')}>Prijavi se</span>
                    </p>
                  </div>
                </form>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <ToastContainer position="top-right" theme="dark" limit={1} autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick pauseOnHover closeButton={false} />
    </div>
  );
}

export default Register;