import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react'; 
import { person, list, shieldCheckmark, statsChart } from 'ionicons/icons';
import '../styles/App.css'; 

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