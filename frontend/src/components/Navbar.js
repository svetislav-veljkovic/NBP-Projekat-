import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { IonIcon } from '@ionic/react'; 
import { person, list, shieldCheckmark, statsChart } from 'ionicons/icons';
import '../styles/App.css'; 
import API, { setResetTimerCallback } from '../api'; // PROMENJENO: usklađeno sa api.js

function OurNavbar({ userId, username }) {
  const [user, setUser] = useState({
    username: username || '',
    name: '',
    lastName: '',
    isAdmin: false
  });

  const logoutTimerRef = useRef(null);

  // FUNKCIJA ZA RESETOVANJE TAJMERA
  const resetTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    if (userId && userId !== -1) {
      // Svaki put kad se pozove, pokreće novih 60s (Sliding Expiration)
      
      logoutTimerRef.current = setTimeout(() => {
        console.warn("Sesija je istekla zbog neaktivnosti na frontendu.");
        window.location.href = '/login';
      }, 60000); 
    }
  }, [userId]);

  useEffect(() => {
    // PROMENJENO: Koristimo tačan naziv funkcije iz api.js
    setResetTimerCallback(resetTimer);

    const fetchUserData = async () => {
      if (userId && userId !== -1) { 
        try {
          const response = await API.get('/User/GetUser');
          setUser({
            ...response.data,
            isAdmin: response.data.isAdmin || response.data.isadmin || false
          });
        } catch (error) {
          console.error('Greška pri dohvatanju profila');
        }
      }
    };

    fetchUserData();

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      // PROMENJENO: Čistimo callback
      setResetTimerCallback(null); 
    };
  }, [userId, resetTimer]);

  const logout = async () => {
    try {
      await API.post('/User/Logout');
      window.location.href = '/login';
    } catch (error) {
      window.location.href = '/login';
    }
  };

  return (
    <Navbar bg="dark" variant="dark" collapseOnSelect expand="lg" fixed="top" className="navbar">
      <Container>
        <Navbar.Brand href="/">🚀 TodoApp</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {userId && userId !== -1 && (
              <>
                <Nav.Link href="/tasks">
                  <IonIcon icon={list} className="me-1" /> Moji Zadaci
                </Nav.Link>
                <Nav.Link href="/productivity">
                  <IonIcon icon={statsChart} className="me-1" /> Produktivnost
                </Nav.Link>
                <Nav.Link href="/scoreboard">Rang Lista</Nav.Link>
                {user.isAdmin && (
                  <NavDropdown 
                    title={<span><IonIcon icon={shieldCheckmark} className="me-1 text-warning" />Admin</span>} 
                    id="admin-dropdown"
                  >
                    <NavDropdown.Item href="/add-admin">Dodaj Admina</NavDropdown.Item>
                    <NavDropdown.Item href="/delete-user" className="text-danger">Obriši Korisnika</NavDropdown.Item>
                  </NavDropdown>
                )}
              </>
            )}
          </Nav>
          <Nav className="align-items-center">
            {(!userId || userId === -1) ? (
              <>
                <Nav.Link href='/login'>Prijavi se</Nav.Link>
                <Nav.Link href="/register" className="btn btn-outline-warning btn-sm ms-lg-2 text-white">Registracija</Nav.Link>
              </>
            ) : (
              <>
                <span className={`me-3 d-none d-lg-inline ${user.isAdmin ? 'text-warning fw-bold' : 'text-white'}`}>
                  {user.username || 'Korisnik'} {user.isAdmin && "(Admin)"}
                </span>
                <NavDropdown 
                  title={<IonIcon icon={person} size="large" className="text-white" />} 
                  id="profile-dropdown" 
                  align="end"
                >
                  <NavDropdown.Item href="/profile">Moj profil</NavDropdown.Item>
                  <NavDropdown.Item href="/editprofile">Izmeni podatke</NavDropdown.Item>
                  <hr className="dropdown-divider" />
                  <NavDropdown.Item onClick={logout} className="text-danger">
                    Odjavi se
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default OurNavbar;