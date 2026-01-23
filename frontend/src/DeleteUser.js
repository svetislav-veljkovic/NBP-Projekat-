import React, { useState } from 'react';
import Axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

function DeleteUser() {
  const [usernameToDelete, setUsernameToDelete] = useState('');

  function submit(e) {
    e.preventDefault();
    
    // Ključna promena: Pretvaramo u mala slova i brišemo prazna mesta
    const cleanUsername = usernameToDelete.toLowerCase().trim();
    const uri = `https://localhost:7248/api/User/Delete?username=${cleanUsername}`;
    
    Axios.delete(uri, { withCredentials: true })
      .then(() => {
        toast.success(`Korisnik "${cleanUsername}" je uspešno obrisan.`);
        setUsernameToDelete('');
      })
      .catch(err => {
        // Izvlačimo tačnu poruku sa backenda (npr. "Korisnik nije pronađen")
        const errorMessage = err.response?.data || "Greška ili nemate administratorska prava.";
        toast.error(errorMessage);
        console.error("Delete error:", err);
      });
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
              placeholder='Unesite korisničko ime (npr. mare)' 
              value={usernameToDelete} 
              onChange={(e) => setUsernameToDelete(e.target.value)} 
              required 
            />
          </div>
        </div>
        <button 
            type='submit' 
            className='sign-in' 
            style={{backgroundColor: '#d9534f', border: 'none', cursor: 'pointer'}}
        >
            Obriši trajno
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default DeleteUser;