import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import API, { setResetTimerCallback } from './api'; // Dodat import za callback

import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './pages/Home';
import LogIn from './pages/LogIn';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Edit from './pages/Edit';
import Tasks from './pages/Tasks';
import Scoreboard from './pages/Scoreboard';
import OurNavbar from './components/Navbar';
import ProductivityChart from './components/ProductivityChart';
import DeleteUser from './admin/DeleteUser';
import AddAdmin from './admin/AddAdmin';

function App() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Funkcija koju API poziva pri svakom zahtevu da osveži sesiju na klijentu
  const resetInactivityTimer = () => {
    // Ovde bi išla logika za tvoj tajmer od 1 min ako ga prikazuješ
    // console.log("Aktivnost detektovana, tajmer resetovan.");
  };

  useEffect(() => {
    // Povezujemo API interceptor sa funkcijom u ovoj komponenti
    setResetTimerCallback(resetInactivityTimer);

    const fetchUser = async () => {
      try {
        const response = await API.get('/User/GetUser');
        const content = response.data;
        setUsername(content.username || content.Username);
        setUserId(content.id || content.Id);
        setIsAdmin(content.isAdmin || content.isadmin || false);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setUserId(-1);
          setUsername('');
          setIsAdmin(false);
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <OurNavbar userId={userId} username={username} isAdmin={isAdmin} />
      
      <div className="main-content-wrapper">
        <div className="container-fluid">
          <Routes>
            <Route path="/" element={<Home userId={userId} />} />
            <Route path="/login" element={<LogIn setUsername={setUsername} setUserId={setUserId} setIsAdmin={setIsAdmin}/>} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/editprofile" element={<Edit />} /> 
            <Route path="/tasks" element={<Tasks userId={userId} />} />
            <Route path="/scoreboard" element={<Scoreboard />} />
            <Route path="/productivity" element={<ProductivityChart />} />
            <Route path="/delete-user" element={<DeleteUser />} />
            <Route path="/add-admin" element={<AddAdmin />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;