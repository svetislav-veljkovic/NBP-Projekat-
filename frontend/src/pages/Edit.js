import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBFile } from 'mdb-react-ui-kit';
import { toast, ToastContainer } from 'react-toastify';
import API from '../api'; 
import '../styles/Register.css'; 
import { Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Edit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  const [user, setUser] = useState({
    id: '',
    name: '',
    lastName: '',
    username: '',
    email: '',
    profilePicture: 'default.png'
  });

  useEffect(() => {
    API.get("/User/GetUser")
      .then(res => {
        setUser(res.data);
        setFetching(false);
      })
      .catch(err => {
        toast.error("Greska pri ucitavanju podataka");
        setFetching(false);
      });
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('id', user.id); 
    formData.append('name', user.name);
    formData.append('lastName', user.lastName);
    
    if (selectedFile) {
        formData.append('image', selectedFile);
    }

    try {
      await API.put("/User/Edit", formData);
      toast.success("Profil uspesno azuriran!");
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || "Greska pri cuvanju";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="fetching-loader">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className='background-radial-gradient edit-profile-page'>
      <MDBContainer className='py-5'>
        <MDBRow className='justify-content-center align-items-center'>
          <MDBCol md='8' lg='6' xl='5'>
            <MDBCard className='bg-glass shadow-5'>
              <MDBCardBody className='p-5'>
                
                <div className='header mb-5 edit-header'>
                    <div className='text'>Izmeni profil</div>
                    <div className='underline'></div>
                </div>

                <form onSubmit={submit}>
                  <div className="mb-4">
                    <label className="form-label text-muted small">Profilna slika</label>
                    <MDBFile onChange={handleFileChange} />
                  </div>

                  <MDBInput 
                    label='Ime' 
                    type='text' 
                    value={user.name} 
                    onChange={(e) => setUser({...user, name: e.target.value})} 
                    wrapperClass='mb-4' 
                    required 
                  />

                  <MDBInput 
                    label='Prezime' 
                    type='text' 
                    value={user.lastName} 
                    onChange={(e) => setUser({...user, lastName: e.target.value})} 
                    wrapperClass='mb-4' 
                    required 
                  />
                  
                  <MDBInput 
                    label='Email' 
                    type='email' 
                    value={user.email} 
                    readOnly 
                    wrapperClass='mb-4' 
                    className='bg-light read-only-input'
                    title="Email nije moguce promeniti." 
                  />
                  
                  <MDBInput 
                    label='Korisnicko ime' 
                    type='text' 
                    value={user.username} 
                    readOnly 
                    wrapperClass='mb-4' 
                    className='bg-light read-only-input'
                    title="Korisnicko ime nije moguce promeniti." 
                  />
                  
                  <MDBRow className="g-2">
                    <MDBCol size="6">
                        <Button variant="light" onClick={() => navigate('/profile')} className="btn-cancel-edit" disabled={loading}>
                          OTKAZI
                        </Button>
                    </MDBCol>
                    <MDBCol size="6">
                        <Button type='submit' className='btn-save-edit' disabled={loading}>
                            {loading ? <Spinner size="sm" /> : 'SACUVAJ'}
                        </Button>
                    </MDBCol>
                  </MDBRow>
                </form>

              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <ToastContainer position="top-right" theme="dark"  limit={1} autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick pauseOnHover closeButton={false}  />
    </div>
  );
}

export default Edit;