import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import React, { useEffect, useCallback, useRef } from 'react';
import { IonIcon } from '@ionic/react'; 
import { person, list, statsChart, trophyOutline } from 'ionicons/icons';
import '../styles/App.css'; 
import API, { setResetTimerCallback } from '../api';

function OurNavbar({ userId, username, isAdmin }) {
  const logoutTimerRef = useRef(null);

  const logout = useCallback(async () => {
    try {
      await API.post('/User/Logout');
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      // Čistimo tajmer pre nego što napustimo stranicu
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      window.location.href = '/login';
    }
  }, []);

  // DEFINIŠEMO resetTimer funkciju (ovo ti je falilo)
  const resetTimer = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    
    // Ako je korisnik ulogovan, postavljamo tajmer na 30 minuta
    // 30 minuta * 60 sekundi * 1000 milisekundi
    if (userId && userId !== -1) {
      logoutTimerRef.current = setTimeout(() => {
        
        logout();
      }, 5 * 60 * 1000);                               // TIMER ZA TTL SESIJU 
    }
  }, [userId, logout]);

  useEffect(() => {
    // Povezujemo API callback sa našom funkcijom
    setResetTimerCallback(resetTimer);
    
    // Inicijalno pokrećemo tajmer
    resetTimer();

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      setResetTimerCallback(null);
    };
  }, [userId, resetTimer]);

  return (
    <Navbar bg="dark" variant="dark" collapseOnSelect expand="lg" fixed="top" className="navbar shadow-sm">
      <Container>
        <Navbar.Brand href="/" className="fw-bold text-warning">🚀 To Do App</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {userId && userId !== -1 && (
              <>
                <Nav.Link href="/tasks"><IonIcon icon={list} /> Zadaci</Nav.Link>
                <Nav.Link href="/productivity"><IonIcon icon={statsChart} /> Statistika</Nav.Link>
                <Nav.Link href="/scoreboard"><IonIcon icon={trophyOutline} /> Rang Lista</Nav.Link>
                {isAdmin && (
                  <NavDropdown title={<span className="text-warning fw-bold">Admin</span>} id="admin-nav">
                    <NavDropdown.Item href="/add-admin">Dodaj Admina</NavDropdown.Item>
                    <NavDropdown.Item href="/delete-user" className="text-danger">Obriši Korisnika</NavDropdown.Item>
                  </NavDropdown>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {(!userId || userId === -1) ? (
              <>
                <Nav.Link href='/login'>Prijava</Nav.Link>
                <Nav.Link href="/register">Registracija</Nav.Link>
              </>
            ) : (
              <NavDropdown title={<><IonIcon icon={person} /> {username}</>} id="user-nav" align="end">
                <NavDropdown.Item href="/profile">Profil</NavDropdown.Item>
                <NavDropdown.Item href="/editprofile">Podešavanja</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout} className="text-danger fw-bold">Odjavi se</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default OurNavbar;