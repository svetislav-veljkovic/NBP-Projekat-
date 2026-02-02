import React, { useState } from 'react';
import API from '../api';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Log-In.css';

function DeleteUser() {
  const [usernameToDelete, setUsernameToDelete] = useState('');
  const [loading, setLoading] = useState(false); // Dodato za bolji UX

  const submit = async (e) => {
    e.preventDefault();
    const cleanUsername = usernameToDelete.toLowerCase().trim();

    if (!window.confirm(`PAŽNJA: Da li ste sigurni da želite trajno da obrišete korisnika "${cleanUsername}"? Svi njegovi zadaci biće uklonjeni i biće odmah izlogovan.`)) {
      return;
    }
    
    setLoading(true);
    try {
      // Poziva backend metodu koja briše iz Cassandre i poziva RedisService.DeleteUserSession
      await API.delete(`/User/Delete?username=${cleanUsername}`);
      
      toast.success(`Korisnik "${cleanUsername}" i svi njegovi podaci su obrisani.`);
      setUsernameToDelete('');
    } catch (err) {
      const errorMsg = err.response?.data || "Greška pri brisanju korisnika.";
      toast.error(typeof errorMsg === 'string' ? errorMsg : "Korisnik verovatno ne postoji.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container1'>
      <form onSubmit={submit} className='w-100'>
        <div className='header'>
          <div className='text' style={{color: '#dc3545'}}>Ukloni Korisnika</div>
          <div className='underline' style={{background: '#dc3545'}}></div>
        </div>
        
        <p className="text-center text-muted mt-3 px-4">
          Unesite korisničko ime. Brisanje će trajno ukloniti nalog iz Cassandre i prekinuti aktivnu sesiju u Redis-u.
        </p>

        <div className='inputs' style={{marginTop: '20px'}}>
          <div className='input-group-custom'>
            <input 
              type='text' 
              placeholder='Korisničko ime...' 
              value={usernameToDelete} 
              onChange={(e) => setUsernameToDelete(e.target.value)} 
              required 
              disabled={loading}
              style={{ 
                padding: '15px', 
                width: '100%', 
                borderRadius: '8px', 
                border: loading ? '1px solid #ccc' : '1px solid #f8d7da' 
              }}
            />
          </div>
        </div>

        <button 
          type='submit' 
          className='sign-in' 
          disabled={loading}
          style={{
            backgroundColor: loading ? '#6c757d' : '#dc3545', 
            marginTop: '30px',
            boxShadow: '0px 4px 10px rgba(220, 53, 69, 0.3)'
          }}
        >
          {loading ? 'BRISANJE...' : 'POTVRDI BRISANJE'}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default DeleteUser;