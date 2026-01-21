import React, { useState } from 'react';
import Axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

function DeleteUser() {
  const [usernameToDelete, setUsernameToDelete] = useState('');

  function submit(e) {
    e.preventDefault();
    // Tvoj backend koristi DELETE /api/User/Delete?id=... ili slično
    const uri = `https://localhost:7248/api/User/Delete?username=${usernameToDelete}`;
    
    Axios.delete(uri, { withCredentials: true })
      .then(() => {
        toast.success(`Korisnik ${usernameToDelete} je obrisan.`);
        setUsernameToDelete('');
      })
      .catch(err => toast.error("Greška ili nemate administratorska prava."));
  }

  return (
    <div className='container1' style={{marginTop: '100px'}}>
      <form onSubmit={submit}>
        <div className='header'>
          <div className='text'>Obriši korisnika (Admin)</div>
          <div className='underline'></div>
        </div>
        <div className='inputs' style={{marginTop: '20px'}}>
          <div className='input'>
            <input 
              type='text' 
              placeholder='Unesite korisničko ime za brisanje' 
              value={usernameToDelete} 
              onChange={(e) => setUsernameToDelete(e.target.value)} 
              required 
            />
          </div>
        </div>
        <button type='submit' className='sign-in' style={{backgroundColor: 'red'}}>Obriši trajno</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default DeleteUser;