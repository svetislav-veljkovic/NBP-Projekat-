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
      const response = await API.post('/User/Login', {
        email: data.email.toLowerCase().trim(),
        password: data.password
      });

      const user = response.data;
      const id = user.id || user.Id;
      const usernameVal = user.username || user.Username;
      const adminVal = user.isAdmin || user.IsAdmin || false;

      toast.success(`Dobrodošao, ${usernameVal}!`);

      if (refreshUser) {
        await refreshUser(); 
      }

      setUserId(id);
      setUsername(usernameVal);
      setIsAdmin(adminVal);
      navigate('/');

    } catch (error) {
      console.error("Login fail detail:", error.response);
      const errorMsg = error.response?.data?.message || error.response?.data || "Pogresan email ili lozinka.";
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
          <div className='input-group-custom'>
            <div className="input-wrapper">
              <IonIcon icon={mail} className="login-icon" />
              <input 
                onChange={handle} 
                id="email" 
                value={data.email} 
                type='email' 
                placeholder='Email' 
                required 
                disabled={loading} 
              />
            </div>
          </div>
          <div className='input-group-custom'>
            <div className="input-wrapper">
              <IonIcon icon={lockClosed} className="login-icon" />
              <input 
                onChange={handle} 
                id="password" 
                value={data.password} 
                type='password' 
                placeholder='Lozinka' 
                required 
                disabled={loading} 
              />
            </div>
          </div>
        </div>
        <button type="submit" className={`sign-in ${loading ? 'loading' : ''}`} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "PRIJAVI SE"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default LogIn;