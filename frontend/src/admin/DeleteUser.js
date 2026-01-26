import React, { useState } from 'react';
import Axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Log-In.css';

function DeleteUser() {
  const [usernameToDelete, setUsernameToDelete] = useState('');

  function submit(e) {
    e.preventDefault();
    const cleanUsername = usernameToDelete.toLowerCase().trim();
    const uri = `https://localhost:7248/api/User/Delete?username=${cleanUsername}`;
    
    Axios.delete(uri, { withCredentials: true })
      .then(() => {
        toast.success(`Korisnik "${cleanUsername}" je uspešno obrisan.`);
        setUsernameToDelete('');
      })
      .catch(err => {
        toast.error(err.response?.data || "Greška pri brisanju.");
      });
  }

  return (
    <div className='container1'>
      <form onSubmit={submit} className='w-100'>
        <div className='header'>
          <div className='text'>Obriši korisnika</div>
          <div className='underline'></div>
        </div>
        
        <div className='inputs'>
          <div className='input-group-custom'>
            <input 
              type='text' 
              placeholder='Unesite korisničko ime...' 
              value={usernameToDelete} 
              onChange={(e) => setUsernameToDelete(e.target.value)} 
              required 
            />
          </div>
        </div>

        <button type='submit' className='sign-in btn-delete'>
            OBRIŠI TRAJNO
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default DeleteUser;