import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import API from './api';

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

  const fetchUser = useCallback(async () => {
    try {
      const response = await API.get('/User/GetUser');
      const content = response.data;
      
      setUsername(content.username); 
      setUserId(content.id); 
      setIsAdmin(content.isAdmin || content.isAdmin === true); 
    } catch (error) {
      setUserId(-1); 
      setUsername('');
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (userId === null) {
      return (
        <div className="loading-screen">
          <div className="spinner-border text-warning" role="status"></div>
          <span className="loading-text">Ucitavanje...</span>
        </div>
      );
    }
    
    if (userId === -1) {
      return <Navigate to="/login" replace />;
    }
    
    if (adminOnly && !isAdmin) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  return (
    <BrowserRouter>
      <OurNavbar key={userId} userId={userId} username={username} isAdmin={isAdmin} setUserId={setUserId} />
      
      <div className="main-content-wrapper">
        <Routes>
          <Route path="/" element={<Home userId={userId} />} />
          <Route path="/login" element={
            <LogIn 
              setUserId={setUserId} 
              setUsername={setUsername} 
              setIsAdmin={setIsAdmin} 
              refreshUser={fetchUser} 
            />
          } />
          <Route path="/register" element={<Register />} />
          <Route path="/scoreboard" element={<Scoreboard username={username} />} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/editprofile" element={<ProtectedRoute><Edit /></ProtectedRoute>} /> 
          <Route path="/tasks" element={<ProtectedRoute><Tasks userId={userId} /></ProtectedRoute>} />
          <Route path="/productivity" element={<ProtectedRoute><ProductivityChart /></ProtectedRoute>} />

          <Route path="/delete-user" element={<ProtectedRoute adminOnly={true}><DeleteUser /></ProtectedRoute>} />
          <Route path="/add-admin" element={<ProtectedRoute adminOnly={true}><AddAdmin /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;