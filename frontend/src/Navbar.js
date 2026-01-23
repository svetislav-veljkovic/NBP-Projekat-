import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react'; 
import { person, list, shieldCheckmark } from 'ionicons/icons';

function OurNavbar({ userId, username }) {
  const [user, setUser] = useState({
    username: username || '',
    name: '',
    lastName: '',
    isAdmin: false
  });

  const baseUrl = "https://localhost:7248/api/User";

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId && userId !== -1) { 
        try {
          const response = await fetch(`${baseUrl}/GetUser`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            mode: 'cors',
          });

          if (response.ok) {
            const userData = await response.json();
            setUser({
              ...userData,
              isAdmin: userData.isAdmin || userData.isadmin || false
            });
          }
        } catch (error) {
          console.error('Greška pri dohvatanju profila:', error);
        }
      }
    };

    fetchUserData();
  }, [userId]);

  const logout = async () => {
    try {
      await fetch(`${baseUrl}/Logout`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" collapseOnSelect expand="lg" fixed="top">
        <Container>
          <Navbar.Brand href="/">TodoApp</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              {/* IZMENJENO: href sada vodi na /tasks umesto na / */}
              {userId && userId !== -1 && (
                <>
                  <Nav.Link href="/tasks">
                    <IonIcon icon={list} style={{marginRight: '5px'}}></IonIcon>
                    Moji Zadaci
                  </Nav.Link>
                  <Nav.Link href="/scoreboard">Rang Lista</Nav.Link>

                  {user.isAdmin && (
                    <NavDropdown title={<span><IonIcon icon={shieldCheckmark} style={{marginRight: '5px'}} />Admin</span>} id="admin-dropdown">
                      <NavDropdown.Item href="/add-admin">Dodaj Admina</NavDropdown.Item>
                      <NavDropdown.Item href="/delete-user" style={{color: 'red'}}>Obriši Korisnika</NavDropdown.Item>
                    </NavDropdown>
                  )}
                </>
              )}
            </Nav>
            
            <Nav>
              {(!userId || userId === -1) ? (
                <>
                  <Nav.Link href='/login'>Prijavi se</Nav.Link>
                  <Nav.Link href="/register">Registracija</Nav.Link>
                </>
              ) : (
                <div className='d-flex align-items-center'>
                  <span style={{color: user.isAdmin ? '#ffc107' : 'white', marginRight: '10px', fontWeight: user.isAdmin ? 'bold' : 'normal'}}>
                    {user.username || 'Korisnik'} {user.isAdmin && "(Admin)"}
                  </span>
                  <NavDropdown title="Profil" id="collapsible-nav-dropdown">
                    <NavDropdown.Item href="/profile">Moj profil</NavDropdown.Item>
                    <NavDropdown.Item href="/editprofile">Izmeni podatke</NavDropdown.Item>
                    <hr />
                    <NavDropdown.Item onClick={logout} style={{color: 'red'}}>
                      Odjavi se
                    </NavDropdown.Item>
                  </NavDropdown>
                  <Nav.Link href="/profile"><IonIcon icon={person}></IonIcon></Nav.Link>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div style={{ paddingTop: '80px' }}></div>
    </>
  );
}

export default OurNavbar;