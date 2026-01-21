import { IonIcon } from '@ionic/react';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { mail, lockClosed } from 'ionicons/icons';
import './Log-In.css';
import { useNavigate } from 'react-router-dom';

function LogIn(props) {
  const { setUserId } = props;
  const navigate = useNavigate();
  const url = "https://localhost:7248/api/User/Login";

  const [data, setData] = useState({
    email: "",
    password: ""
  });

  async function submit(e) {
    e.preventDefault();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', 
        body: JSON.stringify({
          email: data.email,   // C# sada očekuje malo 'e' zbog CamelCase polise
          password: data.password
        }),
        mode: "cors"
      });

      if (!response.ok) {
        // Ako je greška 400 ili 401, ovde čitamo šta backend kaže
        const errorData = await response.text();
        console.error("Login Error Details:", errorData);
        toast.error("Neuspešna prijava: Proverite podatke.");
      } else {
        const result = await response.json();
        console.log("Login Success:", result);
        
        toast.success("Uspešan login!");
        
        // Obaveštavamo aplikaciju da se korisnik promenio
        if (setUserId) {
          setUserId(Math.random()); 
        }
        
        // Malo kašnjenje da bi korisnik video poruku pre preusmeravanja
        setTimeout(() => navigate('/'), 500);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Server nije dostupan.");
    }
  }

  function handle(e) {
    // Standardni način za ažuriranje stanja u Reactu
    setData({
      ...data,
      [e.target.id]: e.target.value
    });
  }

  return (
    <div className='container1'>
      <form onSubmit={submit}>
        <div className='header'>
          <div className='text'>Prijavi se</div>
          <div className='underline'></div>
        </div>
        <div className='inputs'>
          <div className='input'>
            <IonIcon icon={mail}></IonIcon>
            <input 
              onChange={handle} 
              id="email" 
              value={data.email} 
              className='input1' 
              type='email' 
              placeholder='Email adresa' 
              required 
            />
          </div>
          <div className='input'>
            <IonIcon icon={lockClosed}></IonIcon>
            <input 
              onChange={handle} 
              id="password" 
              value={data.password} 
              className='input1' 
              type='password' 
              placeholder='Lozinka' 
              required 
            />
          </div>
        </div>
        <button type="submit" className='sign-in'>Prijavi se</button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default LogIn;