import React, { useEffect, useState, useCallback } from 'react';
import { MDBContainer, MDBCard, MDBCardBody, MDBInput, MDBRow, MDBCol, MDBIcon } from 'mdb-react-ui-kit';
import { Button } from 'react-bootstrap';
import Axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Tasks.css';
import '../styles/App.css'; // Zbog globalnih klasa

function Tasks({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const baseUrl = "https://localhost:7248/api/Task";

  const fetchTasks = useCallback(async () => {
    if (userId) {
      try {
        const res = await Axios.get(`${baseUrl}/MyTasks`, { withCredentials: true });
        setTasks(res.data);
      } catch (err) { 
        console.error("Greška pri dohvatanju:", err); 
      }
    }
  }, [userId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await Axios.post(`${baseUrl}/Add`, newTask, { withCredentials: true });
      setNewTask({ title: '', description: '' });
      toast.success("Zadatak uspešno dodat!");
      fetchTasks();
    } catch (err) { 
      toast.error("Greška pri dodavanju"); 
    }
  };

  const completeTask = async (id) => {
    try {
      await Axios.post(`${baseUrl}/Complete/${id}`, {}, { withCredentials: true });
      toast.success("Zadatak završen! +10 poena");
      fetchTasks();
    } catch (err) { 
      toast.error("Greška pri završavanju"); 
    }
  };

  return (
    <MDBContainer className="mt-5 pt-5 pb-5">
      {/* Centralni naslov */}
      <div className='header mb-5'>
        <div className='text'>📋 Moji Aktivni Zadaci</div>
        <div className='underline'></div>
      </div>

      {/* Forma za dodavanje - Stakleni efekat */}
      <MDBCard className='mb-5 custom-card border-0'>
        <MDBCardBody className="p-4">
          <form onSubmit={handleAddTask}>
            <MDBRow className="align-items-center g-3">
              <MDBCol md="5">
                <MDBInput 
                  label='Šta treba uraditi?' 
                  value={newTask.title} 
                  onChange={e => setNewTask({...newTask, title: e.target.value})} 
                  required 
                />
              </MDBCol>
              <MDBCol md="5">
                <MDBInput 
                  label='Kratak opis' 
                  value={newTask.description} 
                  onChange={e => setNewTask({...newTask, description: e.target.value})} 
                  required 
                />
              </MDBCol>
              <MDBCol md="2">
                <Button type='submit' className="btn-dark-custom w-100 py-2">
                   DODAJ
                </Button>
              </MDBCol>
            </MDBRow>
          </form>
        </MDBCardBody>
      </MDBCard>

      {/* Lista zadataka */}
      <MDBRow>
        {tasks.length > 0 ? (
          tasks.map(t => (
            <MDBCol md="4" key={t.id} className="mb-4">
              <MDBCard className='task-card h-100 border-0 shadow-sm'>
                <MDBCardBody className='d-flex flex-column'>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                        <h5 className="fw-bold task-title">{t.title}</h5>
                        <MDBIcon fas icon="thumbtack" className="text-muted" />
                    </div>
                    <hr className="my-2 opacity-10" />
                    <p className='task-desc'>{t.description}</p>
                  </div>
                  <div className="mt-auto">
                    <Button 
                        variant="success" 
                        className="w-100 btn-complete d-flex align-items-center justify-content-center gap-2"
                        onClick={() => completeTask(t.id)}
                    >
                      <MDBIcon fas icon="check-circle" /> Završi zadatak
                    </Button>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))
        ) : (
          <MDBCol size="12" className="text-center mt-5">
             <MDBIcon fas icon="tasks" size="4x" className="text-muted mb-3 opacity-25" />
             <h4 className="text-muted">Nemaš aktivnih zadataka. Vreme je za odmor!</h4>
          </MDBCol>
        )}
      </MDBRow>
      <ToastContainer position="bottom-right" />
    </MDBContainer>
  );
}
export default Tasks;