import React, { useEffect, useState, useCallback } from 'react';
import { MDBContainer, MDBCard, MDBCardBody, MDBInput, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { Button } from 'react-bootstrap';
import Axios from 'axios';

function Tasks({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const baseUrl = "https://localhost:7248/api/Task";

  const fetchTasks = useCallback(async () => {
    // Provera da li userId postoji (Guid nije prazan ili -1)
    if (userId) {
      try {
        const res = await Axios.get(`${baseUrl}/MyTasks`, { withCredentials: true });
        setTasks(res.data);
      } catch (err) { 
        console.error("Greška pri učitavanju zadataka:", err); 
      }
    }
  }, [userId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();

    // VAŽNO: Pošto Program.cs koristi CamelCase, šaljemo mala slova
    const taskToSend = {
      title: newTask.title,
      description: newTask.description
    };

    try {
      await Axios.post(`${baseUrl}/Add`, taskToSend, { withCredentials: true });
      setNewTask({ title: '', description: '' });
      fetchTasks();
    } catch (err) {
      console.error("Detalji greške:", err.response?.data);
      alert("Greška pri dodavanju: " + (err.response?.data?.message || "Proveri konzolu"));
    }
  };

  const completeTask = async (id) => {
    try {
      await Axios.post(`${baseUrl}/Complete/${id}`, {}, { withCredentials: true });
      fetchTasks();
    } catch (err) { 
      alert("Greška pri završavanju"); 
    }
  };

  return (
    <MDBContainer className="mt-5 pt-5">
      <h2 className='text-center mb-4'>📋 Moji Aktivni Zadaci</h2>
      <MDBCard className='mb-4 shadow-sm'>
        <MDBCardBody>
          <form onSubmit={handleAddTask} className="d-flex gap-2">
            <MDBInput 
              label='Naslov' 
              value={newTask.title} 
              onChange={e => setNewTask({...newTask, title: e.target.value})} 
              required 
            />
            <MDBInput 
              label='Opis' 
              value={newTask.description} 
              onChange={e => setNewTask({...newTask, description: e.target.value})} 
              required 
            />
            <Button type='submit' variant="dark">Dodaj</Button>
          </form>
        </MDBCardBody>
      </MDBCard>

      <MDBRow>
        {tasks && tasks.length > 0 ? (
          tasks.map(t => (
            <MDBCol md="4" key={t.id} className="mb-3">
              <MDBCard className='h-100 shadow-sm'>
                <MDBCardBody className='d-flex flex-column justify-content-between'>
                  <div>
                    <h5>{t.title}</h5>
                    <p className='small text-muted'>{t.description}</p>
                  </div>
                  <Button 
                    variant="outline-success" 
                    size="sm" 
                    onClick={() => completeTask(t.id)}
                  >
                    Završi ✓
                  </Button>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))
        ) : (
          <p className="text-center">Nema aktivnih zadataka.</p>
        )}
      </MDBRow>
    </MDBContainer>
  );
}

export default Tasks;