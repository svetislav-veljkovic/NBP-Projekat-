import React, { useState } from 'react';
import API from '../api';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Log-In.css';

function DeleteUser() {
  const [usernameToDelete, setUsernameToDelete] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const cleanUsername = usernameToDelete.toLowerCase().trim();

    // Dodata sigurnosna potvrda
    if (!window.confirm(`Da li ste sigurni da želite trajno da obrišete korisnika "${cleanUsername}"? Ova akcija se ne može poništiti.`)) {
      return;
    }
    
    try {
      // API instanca automatski šalje session cookie koji backend proverava za [Authorize(Roles = "Admin")]
      await API.delete(`/User/Delete?username=${cleanUsername}`);
      
      toast.success(`Korisnik "${cleanUsername}" je uspešno obrisan.`);
      setUsernameToDelete('');
    } catch (err) {
      // Provera da li server vraća specifičnu poruku o grešci
      const errorMsg = err.response?.data || "Greška pri brisanju korisnika.";
      toast.error(typeof errorMsg === 'string' ? errorMsg : "Neuspešna akcija.");
    }
  };

  return (
    <div className='container1'>
      <form onSubmit={submit} className='w-100'>
        <div className='header'>
          <div className='text'>Obriši korisnika</div>
          <div className='underline'></div>
        </div>
        
        <p className="text-center text-muted mt-3 px-4">
          Unesite tačno korisničko ime osobe koju želite da uklonite iz sistema.
        </p>

        <div className='inputs'>
          <div className='input-group-custom'>
            <input 
              type='text' 
              placeholder='Korisničko ime...' 
              value={usernameToDelete} 
              onChange={(e) => setUsernameToDelete(e.target.value)} 
              required 
              style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>
        </div>

        <button type='submit' className='sign-in' style={{backgroundColor: '#dc3545', marginTop: '20px'}}>
            OBRIŠI TRAJNO
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default DeleteUser;