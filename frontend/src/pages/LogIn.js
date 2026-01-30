import { IonIcon } from '@ionic/react';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { mail, lockClosed } from 'ionicons/icons';
import '../styles/Log-In.css';
import '../styles/App.css'; 
import { useNavigate } from 'react-router-dom';
import API from '../api'; // Uvozimo tvoju centralnu Axios instancu

function LogIn(props) {
  const { setUserId } = props;
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: ""
  });

  async function submit(e) {
    e.preventDefault();
    try {
      /** * Koristimo API.post. 
       * 1. Putanja je samo '/User/Login' jer je baseURL već u api.js
       * 2. Ne treba JSON.stringify, Axios to radi sam
       * 3. withCredentials: true se dodaje automatski iz api.js
       */
      const response = await API.post('/User/Login', {
        email: data.email,
        password: data.password
      });

      // Ako dođe do ovde, status je 200 OK
      toast.success("Uspešan login!");
      
      if (setUserId) {
        setUserId(Math.random()); 
      }
      
      setTimeout(() => navigate('/'), 800);

    } catch (error) {
      // Axios greške hvata u catch bloku
      if (error.response) {
        // Server je odgovorio sa greškom (npr. 401, 400)
        toast.error(error.response.data || "Neuspešna prijava: Proverite podatke.");
      } else {
        // Server nije dostupan ili je mreža u prekidu
        toast.error("Server nije dostupan.");
      }
    }
  }

  function handle(e) {
    setData({
      ...data,
      [e.target.id]: e.target.value
    });
  }

  return (
    <div className='container1'>
      <form onSubmit={submit} className="w-100">
        <div className='header'>
          <div className='text'>Prijavi se</div>
          <div className='underline'></div>
        </div>

        <div className='inputs'>
          <div className='input-group-custom'>
            <div className="d-flex align-items-center bg-light px-3 rounded-3" style={{border: '1px solid #ddd'}}>
              <IonIcon icon={mail} style={{fontSize: '20px', color: '#555'}} />
              <input 
                onChange={handle} 
                id="email" 
                value={data.email} 
                type='email' 
                placeholder='Email adresa' 
                required 
                style={{background: 'transparent', border: 'none', outline: 'none', width: '100%', padding: '12px'}}
              />
            </div>
          </div>

          <div className='input-group-custom'>
            <div className="d-flex align-items-center bg-light px-3 rounded-3" style={{border: '1px solid #ddd'}}>
              <IonIcon icon={lockClosed} style={{fontSize: '20px', color: '#555'}} />
              <input 
                onChange={handle} 
                id="password" 
                value={data.password} 
                type='password' 
                placeholder='Lozinka' 
                required 
                style={{background: 'transparent', border: 'none', outline: 'none', width: '100%', padding: '12px'}}
              />
            </div>
          </div>
        </div>

        <button type="submit" className='sign-in'>
          PRIJAVI SE
        </button>

        <div className="text-center mt-3">
            <small className="text-muted">Nemaš nalog? <span style={{cursor:'pointer', color:'#2B3035', fontWeight:'bold'}} onClick={() => navigate('/register')}>Registruj se</span></small>
        </div>
      </form>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default LogIn;