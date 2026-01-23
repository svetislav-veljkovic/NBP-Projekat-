import React, { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import LogIn from './LogIn';
import Register from './Register';
import OurNavbar from './Navbar';
import Profile from './Profile';
// OBRATI PAŽNJU OVDE: 
// Ako se fajl zove Edit.js, uvoziš Edit. Ako se zove EditProfile.js, uvoziš EditProfile.
import Edit from './Edit'; 

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
          setUsername(content.username || content.Username);
          setUserId(content.id || content.Id);
        } else {
          setUserId(null);
          setUsername('');
        }
      } catch (error) {
        console.error('Nije moguće dohvatiti korisnika:', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <OurNavbar userId={userId} username={username} />
      <Routes>
        <Route path="/" element={<Home userId={userId} />} />
        <Route path="/login" element={<LogIn setUsername={setUsername} setUserId={setUserId}/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Putanja ostaje ista, ali element mora da odgovara imenu koji si uvezao gore */}
        <Route path="/editprofile" element={<Edit />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;