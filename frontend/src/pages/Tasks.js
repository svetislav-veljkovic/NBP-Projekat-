import React, { useEffect, useState, useCallback } from 'react';
import { MDBContainer, MDBCard, MDBCardBody, MDBInput, MDBRow, MDBCol, MDBIcon, MDBBadge } from 'mdb-react-ui-kit';
import { Button, Form } from 'react-bootstrap';
import API from '../api';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Tasks.css';
import '../styles/App.css'; 

function Tasks({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('due');
  const [loading, setLoading] = useState(false);

  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', dueDate: '' });
  const [editingTask, setEditingTask] = useState(null); 
  const [editData, setEditData] = useState({ title: '', description: '', priority: 'Medium', dueDate: '' });

  const baseUrl = "/Task";

  // Dinamički računamo trenutno vreme za "min" atribut (format: YYYY-MM-DDTHH:mm)
  const minDateTime = new Date().toISOString().slice(0, 16);

  const fetchTasks = useCallback(async () => {
    if (userId === null || userId === -1) return;
    setLoading(true);
    try {
      const res = await API.get(`${baseUrl}/MyTasks?status=active&sortBy=${sortBy}`);
      setTasks(res.data);
    } catch (err) { 
      console.error("Greška pri dohvatanju:", err); 
      toast.error("Neuspelo osvežavanje zadataka.");
    } finally {
      setLoading(false);
    }
  }, [userId, sortBy]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "Nema roka";
    const date = new Date(dateString);
    return date.toLocaleString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleAddTask = async (e) => {
    e.preventDefault(); // Browser prvo proverava 'required' polja

    // Dodatna JS provera za svaki slučaj (ako neko zaobiđe HTML validaciju)
    if (new Date(newTask.dueDate) < new Date()) {
      toast.warning("Rok ne može biti u prošlosti!");
      return;
    }

    try {
      await API.post(`${baseUrl}/Add`, newTask);
      setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '' });
      toast.success("Zadatak dodat!");
      fetchTasks();
    } catch (err) { 
      toast.error("Greška pri dodavanju"); 
    }
  };

  const startEdit = (task) => {
    const taskId = task.id || task.Id;
    setEditingTask(taskId);
    const d = task.dueDate || task.DueDate ? new Date(task.dueDate || task.DueDate) : new Date();
    const pad = (n) => n < 10 ? '0' + n : n;
    const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setEditData({ 
      title: task.title || task.Title, 
      description: task.description || task.Description, 
      priority: task.priority || task.Priority,
      dueDate: formattedDate 
    });
  };

  const handleUpdate = async (id) => {
    if (!editData.dueDate) {
        toast.warning("Rok je obavezan!");
        return;
    }
    try {
      await API.put(`${baseUrl}/Update/${id}`, editData);
      toast.success("Zadatak izmenjen!");
      setEditingTask(null);
      fetchTasks();
    } catch (err) { toast.error("Greška pri izmeni."); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Da li želite da obrišete ovaj zadatak?")) return;
    try {
      await API.delete(`${baseUrl}/Delete/${id}`);
      toast.info("Zadatak obrisan");
      fetchTasks();
    } catch (err) { toast.error("Greška pri brisanju"); }
  };

  const completeTask = async (id) => {
    try {
      await API.post(`${baseUrl}/Complete/${id}`, {});
      toast.success(`Zadatak završen!`);
      fetchTasks();
    } catch (err) { toast.error("Greška!"); }
  };

  return (
    <MDBContainer className="mt-5 pt-5 pb-5">
      <div className='header mb-5 text-center'>
        <h2 className='fw-bold'>📋 AKTIVNI ZADACI</h2>
        <div className='underline mx-auto'></div>
      </div>

      <MDBCard className='mb-4 border-0 shadow-sm'>
        <MDBCardBody className="p-4">
          <form onSubmit={handleAddTask}>
            <MDBRow className="g-3 align-items-start">
              <MDBCol md="3">
                <MDBInput label='Naslov' value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
              </MDBCol>
              <MDBCol md="3">
                <MDBInput label='Opis' value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} required />
              </MDBCol>
              <MDBCol md="2">
                <MDBInput 
                  type="datetime-local" 
                  label='Rok' 
                  labelClass='active' 
                  value={newTask.dueDate} 
                  min={minDateTime}
                  required
                  onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
                />
              </MDBCol>
              <MDBCol md="2">
                <Form.Select 
                  value={newTask.priority} 
                  onChange={e => setNewTask({...newTask, priority: e.target.value})} 
                  className="shadow-none"
                  style={{ height: '38px' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Select>
                <label className="small text-muted mt-1 ps-1">Prioritet</label>
              </MDBCol>
              <MDBCol md="2">
                <Button type='submit' className="btn-primary w-100 fw-bold" style={{ height: '38px' }}>
                  DODAJ
                </Button>
              </MDBCol>
            </MDBRow>
          </form>
        </MDBCardBody>
      </MDBCard>

      <div className="d-flex justify-content-end align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
           <span className="small fw-bold text-muted text-uppercase">Sortiraj:</span>
           <Form.Select size="sm" className="rounded-pill shadow-sm" style={{width: '160px'}} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
             <option value="due">Rok</option>
             <option value="priority">Prioritet</option>
             <option value="date">Datum kreiranja</option>
           </Form.Select>
        </div>
      </div>

      <MDBRow>
        {loading ? (
          <div className="text-center w-100 my-5"><div className="spinner-border text-primary"></div></div>
        ) : tasks.length > 0 ? (
          tasks.map(t => {
            const taskId = t.id || t.Id;
            return (
              <MDBCol md="4" key={taskId} className="mb-4">
                <MDBCard className="task-card h-100 border-0 shadow-sm">
                  <MDBCardBody className="d-flex flex-column">
                    {editingTask === taskId ? (
                      <div className="d-flex flex-column gap-2">
                        <MDBInput size="sm" label="Naslov" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} required />
                        <MDBInput size="sm" label="Opis" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} required />
                        <MDBInput size="sm" type="datetime-local" label="Rok" labelClass='active' value={editData.dueDate} min={minDateTime} required onChange={e => setEditData({...editData, dueDate: e.target.value})} />
                        <Form.Select size="sm" value={editData.priority} onChange={e => setEditData({...editData, priority: e.target.value})}>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </Form.Select>
                        <div className="d-flex gap-2 mt-2">
                          <Button size="sm" variant="success" className="w-100" onClick={() => handleUpdate(taskId)}>Sačuvaj</Button>
                          <Button size="sm" variant="light" className="w-100" onClick={() => setEditingTask(null)}>Nazad</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between mb-2">
                          <MDBBadge color={(t.priority || t.Priority) === 'High' ? 'danger' : (t.priority || t.Priority) === 'Medium' ? 'warning' : 'info'}>
                            {t.priority || t.Priority}
                          </MDBBadge>
                          <div className="d-flex gap-3">
                            <MDBIcon fas icon="pen" className="text-primary action-icon" style={{ cursor: 'pointer' }} onClick={() => startEdit(t)} />
                            <MDBIcon fas icon="trash-alt" className="text-danger action-icon" style={{ cursor: 'pointer' }} onClick={() => deleteTask(taskId)} />
                          </div>
                        </div>
                        <h5 className="fw-bold mb-1">{t.title || t.Title}</h5>
                        <p className="text-muted small flex-grow-1 mb-3">{t.description || t.Description}</p>
                        <div className="task-dates border-top pt-2 mt-auto">
                          <div className="small text-muted mb-1"><MDBIcon far icon="clock" className="me-2"/>Dodato: {formatDateTime(t.createdAt || t.CreatedAt)}</div>
                          <div className={`small mb-1 ${new Date(t.dueDate || t.DueDate) < new Date() ? 'text-danger fw-bold' : 'text-muted'}`}>
                            <MDBIcon far icon="calendar-times" className="me-2"/>Rok: {formatDateTime(t.dueDate || t.DueDate)}
                          </div>
                        </div>
                        <Button variant="outline-success" className="w-100 rounded-pill fw-bold mt-3 btn-sm" onClick={() => completeTask(taskId)}>Završi</Button>
                      </>
                    )}
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            );
          })
        ) : (
          <div className="text-center w-100 py-5"><p className="text-muted">Trenutno nema aktivnih zadataka.</p></div>
        )}
      </MDBRow>
      <ToastContainer position="bottom-right" theme="colored" />
    </MDBContainer>
  );
}

export default Tasks;