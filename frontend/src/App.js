import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. STILOVI (Sada su u /styles)
import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// 2. STRANICE (Sada su u /pages)
import Home from './pages/Home';
import LogIn from './pages/LogIn';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Edit from './pages/Edit'; // ISPRAVLJENO: Putanja je sada ./pages/Edit
import Tasks from './pages/Tasks';
import Scoreboard from './pages/Scoreboard';

// 3. KOMPONENTE (Sada su u /components)
import OurNavbar from './components/Navbar';
import ProductivityChart from './components/ProductivityChart';

// 4. ADMIN (Sada su u /admin)
import DeleteUser from './admin/DeleteUser';
import AddAdmin from './admin/AddAdmin';

function App() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
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
  }, [userId]); 

  return (
    <BrowserRouter>
      {/* Navbar sa prosleđenim podacima o sesiji */}
      <OurNavbar userId={userId} username={username} isAdmin={isAdmin} />
      
      <div className="container-fluid mt-3">
        <Routes>
          <Route path="/" element={<Home userId={userId} />} />
          <Route path="/login" element={<LogIn setUsername={setUsername} setUserId={setUserId}/>} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/editprofile" element={<Edit />} /> 
          <Route path="/tasks" element={<Tasks userId={userId} />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          
          {/* Ruta za dijagram produktivnosti */}
          <Route path="/productivity" element={<ProductivityChart />} />
          
          {/* Admin rute */}
          <Route path="/delete-user" element={<DeleteUser />} />
          <Route path="/add-admin" element={<AddAdmin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;