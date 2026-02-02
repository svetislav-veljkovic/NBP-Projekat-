import React, { useState } from 'react';
import API from '../api';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Log-In.css';

function DeleteUser() {
  const [usernameToDelete, setUsernameToDelete] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const cleanUsername = usernameToDelete.toLowerCase().trim();

    if (!window.confirm(`PAZNJA: Da li ste sigurni da zelite trajno da obrisete korisnika "${cleanUsername}"? Svi njegovi zadaci bice uklonjeni i bice odmah izlogovan.`)) {
      return;
    }
    
    setLoading(true);
    try {
      await API.delete(`/User/Delete?username=${cleanUsername}`);
      toast.success(`Korisnik "${cleanUsername}" i svi njegovi podaci su obrisani.`);
      setUsernameToDelete('');
    } catch (err) {
      const errorMsg = err.response?.data || "Greska pri brisanju korisnika.";
      toast.error(typeof errorMsg === 'string' ? errorMsg : "Korisnik verovatno ne postoji.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container1'>
      <form onSubmit={submit} className='w-100'>
        <div className='header danger-header'>
          <div className='text'>Ukloni Korisnika</div>
          <div className='underline'></div>
        </div>
        
        <p className="admin-instruction-text">
          Unesite korisnicko ime. Brisanje ce trajno ukloniti nalog.
        </p>

        <div className='inputs admin-input-margin'>
          <div className='input-group-custom'>
            <input 
              type='text' 
              className={`admin-input ${loading ? '' : 'input-danger-border'}`}
              placeholder='Korisničko ime...' 
              value={usernameToDelete} 
              onChange={(e) => setUsernameToDelete(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
        </div>

        <button 
          type='submit' 
          className={`sign-in btn-delete-final ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'BRISANJE...' : 'POTVRDI BRISANJE'}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default DeleteUser;