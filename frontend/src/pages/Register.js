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

    // Priprema podataka: Trim i pretvaranje u mala slova za username/email
    // Ovo osigurava da Cassandra i Redis uvek barataju sa konzistentnim ključevima
    const payload = {
      ...data,
      username: data.username.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
    };

    setIsLoading(true);
    try {
      await API.post('/User/Register', payload);
      
      toast.success("Uspešna registracija! Preusmeravanje na prijavu...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data || "Greška pri registraciji";
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
            <h1 className="my-5 display-3 fw-bold ls-tight px-3" style={{ color: '#555' }}>
              Pridruži se <br />
              <span style={{ color: '#4c00b0' }}>Organizuj se lako</span>
            </h1>
            <p className="px-3 text-muted">
              Postani deo zajednice koja efikasno upravlja svojim vremenom. 
              Završi zadatke, skupljaj poene i osvoji vrh rang liste!
            </p>
          </MDBCol>

          <MDBCol md="6" style={{ maxWidth: '500px' }}>
            <MDBCard className="bg-glass shadow-5">
              <MDBCardBody className="p-5">
                <div className='header mb-4' style={{alignItems: 'flex-start'}}>
                    <div className='text' style={{fontSize: '28px'}}>Registracija</div>
                    <div className='underline' style={{margin: '0', width: '40px'}}></div>
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
                  
                  <MDBInput onChange={handleInputChange} id="username" label="Korisničko ime" type="text" required wrapperClass="mb-4" disabled={isLoading} />
                  <MDBInput onChange={handleInputChange} id="email" label="Email adresa" type="email" required wrapperClass="mb-4" disabled={isLoading} />
                  <MDBInput onChange={handleInputChange} id="password" label="Lozinka" type="password" required wrapperClass="mb-4" disabled={isLoading} />
                  <MDBInput onChange={handleInputChange} id="repeatedPassword" label="Ponovite lozinku" type="password" required wrapperClass="mb-4" disabled={isLoading} />

                  <button 
                    type="submit" 
                    className="btn-dark-custom w-100 mb-4 py-2 d-flex justify-content-center align-items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner size="sm" className="me-2" /> : 'KREIRAJ NALOG'}
                  </button>

                  <div className="text-center">
                    <p className="small text-muted">
                        Već imate nalog? <span className="fw-bold text-dark" style={{cursor:'pointer'}} onClick={() => navigate('/login')}>Prijavi se</span>
                    </p>
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