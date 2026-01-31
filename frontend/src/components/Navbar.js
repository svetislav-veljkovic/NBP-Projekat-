import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { IonIcon } from '@ionic/react'; 
import { person, list, shieldCheckmark, statsChart } from 'ionicons/icons';
import '../styles/App.css'; 
import API, { setResetTimerCallback } from '../api';

function OurNavbar({ userId, username }) {
  const [user, setUser] = useState({
    username: username || '',
    name: '',
    lastName: '',
    isAdmin: false
  });

  const logoutTimerRef = useRef(null);

  // LOGIKA ZA AUTOMATSKU ODJAVU (Frontend osigurač)
  const resetTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    // Ako je korisnik ulogovan, pokrećemo tajmer od 60 sekundi
    // Svaki mrežni zahtev kroz API.js će pozvati ovu funkciju i resetovati sat
    if (userId && userId !== -1) {
      logoutTimerRef.current = setTimeout(() => {
        console.warn("Sesija je istekla zbog neaktivnosti na frontendu.");
        logout(); // Pozivamo logout funkciju za čišćenje
      }, 60000); 
    }
  }, [userId]);

  useEffect(() => {
    // Povezujemo Navbar sa API presretačem
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
      setResetTimerCallback(null); // Čistimo referencu pri unmount-u
    };
  }, [userId, resetTimer]);

  const logout = async () => {
    try {
      // Obaveštavamo backend da uništi sesiju u Redis-u
      await API.post('/User/Logout');
    } catch (error) {
      console.error("Greška pri logout-u na serveru", error);
    } finally {
      // Bez obzira na ishod na serveru, čistimo frontend i vraćamo na login
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