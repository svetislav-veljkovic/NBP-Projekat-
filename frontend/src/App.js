import React, { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import LogIn from './LogIn';
import Register from './Register';
import OurNavbar from './Navbar';

function App() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('https://localhost:7248/api/User/GetUser', {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          mode: 'cors',
        });

        if (response.ok) {
          const content = await response.json();
          setUsername(content.username);
          setUserId(content.id);
        } else {
          setUserId(null);
          setUsername('');
        }
      } catch (error) {
        console.error('Nije moguće dohvatiti korisnika:', error);
      }
    };
    fetchUser();
  }, [userId]);

  return (
    <BrowserRouter>
      <OurNavbar userId={userId} username={username} />
      <Routes>
        <Route path="/" element={<Home userId={userId} />} />
        <Route path="/login" element={<LogIn setUsername={setUsername} setUserId={setUserId}/>} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;