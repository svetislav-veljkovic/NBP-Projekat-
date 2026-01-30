import React, { useState } from 'react';
import API from '../api';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Log-In.css';

function DeleteUser() {
  const [usernameToDelete, setUsernameToDelete] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const cleanUsername = usernameToDelete.toLowerCase().trim();
    
    try {
      await API.delete(`/User/Delete?username=${cleanUsername}`);
      toast.success(`Korisnik "${cleanUsername}" je uspešno obrisan.`);
      setUsernameToDelete('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Greška pri brisanju.");
    }
  };

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
              placeholder='Korisničko ime...' 
              value={usernameToDelete} 
              onChange={(e) => setUsernameToDelete(e.target.value)} 
              required 
            />
          </div>
        </div>

        <button type='submit' className='sign-in' style={{backgroundColor: '#dc3545'}}>
            OBRIŠI TRAJNO
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default DeleteUser;