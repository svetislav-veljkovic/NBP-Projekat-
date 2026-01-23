import React, { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import LogIn from './LogIn';
import Register from './Register';
import OurNavbar from './Navbar';
import Profile from './Profile';
import Edit from './Edit'; 

import DeleteUser from './DeleteUser';
import AddAdmin from './AddAdmin';

function App() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  // 1. DODATO: Stanje za proveru admin prava
  const [isAdmin, setIsAdmin] = useState(false);

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
          // 2. DODATO: Čitamo isAdmin polje iz baze (Cassandra)
          setIsAdmin(content.isAdmin || content.isadmin || false);
        } else {
          setUserId(null);
          setUsername('');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Nije moguće dohvatiti korisnika:', error);
      }
    };
    fetchUser();
    // 3. DODATO: userId u dependency array da se osveži nakon logina
  }, [userId]); 

  return (
    <BrowserRouter>
      {/* 4. PROSLEĐUJEMO isAdmin u Navbar da bi on znao da prikaže dugmiće */}
      <OurNavbar userId={userId} username={username} isAdmin={isAdmin} />
      
      <Routes>
        <Route path="/" element={<Home userId={userId} />} />
        <Route path="/login" element={<LogIn setUsername={setUsername} setUserId={setUserId}/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/editprofile" element={<Edit />} /> 
        
        {/* 5. NOVE RUTE: Bez ovoga stranice ne postoje u browseru */}
        <Route path="/delete-user" element={<DeleteUser />} />
        <Route path="/add-admin" element={<AddAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;