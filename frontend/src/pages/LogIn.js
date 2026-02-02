import { IonIcon } from '@ionic/react';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { mail, lockClosed } from 'ionicons/icons';
import '../styles/Log-In.css';
import '../styles/App.css'; 
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Spinner } from 'react-bootstrap';

function LogIn({ setUserId, setUsername, setIsAdmin, refreshUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ email: "", password: "" });

async function submit(e) {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Slanje zahteva
    const response = await API.post('/User/Login', {
      email: data.email.toLowerCase().trim(),
      password: data.password
    });

    // 2. Provera strukture podataka (Backend šalje camelCase zbog JsonSerializerOptions)
    const user = response.data;
    
    // Čuvanje osnovnih podataka odmah u state-u LogIn komponente
    // Koristimo i velika i mala slova za svaki slučaj, mada bi camelCase trebao biti standard
    const id = user.id || user.Id;
    const usernameVal = user.username || user.Username;
    const adminVal = user.isAdmin || user.IsAdmin || false;

    toast.success(`Dobrodošao, ${usernameVal}!`);

    // 3. Umesto setTimeout, koristimo asinhroni refresh i await
    // refreshUser() će pozvati /api/User/GetUser koji sada ima kolačić
    if (refreshUser) {
      await refreshUser(); 
    }

    // Ažuriramo globalno stanje u App.js preko prosleđenih funkcija
    setUserId(id);
    setUsername(usernameVal);
    setIsAdmin(adminVal);

    // 4. Navigacija nakon što je sve spremno
    navigate('/');

  } catch (error) {
    console.error("Login fail detail:", error.response);
    
    // Hvatanje specifične poruke sa backenda (npr. "Nevalidni podaci u tokenu")
    const errorMsg = error.response?.data?.message || error.response?.data || "Pogrešan email ili lozinka.";
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
}

  function handle(e) {
    setData({ ...data, [e.target.id]: e.target.value });
  }

  return (
    <div className='container1'>
      <form onSubmit={submit} className="w-100">
        <div className='header'>
          <div className='text'>Prijavi se</div>
          <div className='underline'></div>
        </div>
        <div className='inputs'>
          <div className='input-group-custom mb-3'>
            <div className="d-flex align-items-center bg-light px-3 rounded-3 border">
              <IonIcon icon={mail} />
              <input 
                onChange={handle} 
                id="email" 
                value={data.email} 
                type='email' 
                placeholder='Email' 
                required 
                disabled={loading} 
                style={{background: 'transparent', border: 'none', outline: 'none', width: '100%', padding: '12px'}} 
              />
            </div>
          </div>
          <div className='input-group-custom mb-3'>
            <div className="d-flex align-items-center bg-light px-3 rounded-3 border">
              <IonIcon icon={lockClosed} />
              <input 
                onChange={handle} 
                id="password" 
                value={data.password} 
                type='password' 
                placeholder='Lozinka' 
                required 
                disabled={loading} 
                style={{background: 'transparent', border: 'none', outline: 'none', width: '100%', padding: '12px'}} 
              />
            </div>
          </div>
        </div>
        <button type="submit" className='sign-in' disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "PRIJAVI SE"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default LogIn;