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
  const minDateTime = new Date().toISOString().slice(0, 16);

  const fetchTasks = useCallback(async () => {
    if (userId === null || userId === -1) return;
    setLoading(true);
    try {
      const res = await API.get(`${baseUrl}/MyTasks?status=active&sortBy=${sortBy}`);
      setTasks(res.data);
    } catch (err) { 
      toast.error("Neuspelo osvezavanje zadataka.");
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
    e.preventDefault();
    if (new Date(newTask.dueDate) < new Date()) {
      toast.warning("Rok ne moze biti u proslosti!");
      return;
    }
    try {
      await API.post(`${baseUrl}/Add`, newTask);
      setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '' });
      toast.success("Zadatak dodat!");
      fetchTasks();
    } catch (err) { toast.error("Greska pri dodavanju"); }
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
    try {
      await API.put(`${baseUrl}/Update/${id}`, editData);
      toast.success("Zadatak izmenjen!");
      setEditingTask(null);
      fetchTasks();
    } catch (err) { toast.error("Greska pri izmeni."); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Da li zelite da obrisete ovaj zadatak?")) return;
    try {
      await API.delete(`${baseUrl}/Delete/${id}`);
      toast.info("Zadatak obrisan");
      fetchTasks();
    } catch (err) { toast.error("Greska pri brisanju"); }
  };

  const completeTask = async (id) => {
    try {
      await API.post(`${baseUrl}/Complete/${id}`, {});
      toast.success(`Zadatak zavrsen!`);
      fetchTasks();
    } catch (err) { toast.error("Greska!"); }
  };

  return (
    <MDBContainer className="mt-5 pt-5 pb-5">
      <div className='header mb-5'>
        <div className='text'>📋 Aktivni Zadaci</div>
        <div className='underline'></div>
      </div>

      <MDBCard className='mb-4 border-0 shadow-sm task-add-card'>
  <MDBCardBody className="p-4">
    <form onSubmit={handleAddTask}>
      <MDBRow className="g-3 align-items-end"> 
        <MDBCol md="3">
          <MDBInput label='Naslov' value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
        </MDBCol>
        <MDBCol md="3">
          <MDBInput label='Opis' value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} required />
        </MDBCol>
        <MDBCol md="2">
          <MDBInput type="datetime-local" label='Rok' labelClass='active' value={newTask.dueDate} min={minDateTime} required onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
        </MDBCol>
        <MDBCol md="2">
   
          
          <Form.Select 
            value={newTask.priority} 
            onChange={e => setNewTask({...newTask, priority: e.target.value})} 
            className="shadow-none custom-select-task"
            style={{ marginTop: '0px' }}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Form.Select>
          <label className="small text-muted mb-1 ps-1">Prioritet</label>
        </MDBCol>
        <MDBCol md="2">
          <button type='submit' className="sign-in m-0 w-100" style={{ height: '37px', padding: '0' }}>DODAJ</button>
          
        </MDBCol>
        
      </MDBRow>
    </form>
  </MDBCardBody>
</MDBCard>

      <div className="d-flex justify-content-end align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
           <span className="small fw-bold text-muted">SORTIRAJ:</span>
           <Form.Select size="sm" className="rounded-pill border-dark shadow-none" style={{width: '160px'}} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
             <option value="due">Rok</option>
             <option value="priority">Prioritet</option>
             <option value="date">Datum kreiranja</option>
           </Form.Select>
        </div>
      </div>

      <MDBRow>
        {loading ? (
          <div className="text-center w-100 my-5"><div className="spinner-border text-warning"></div></div>
        ) : tasks.length > 0 ? (
          tasks.map(t => {
            const taskId = t.id || t.Id;
            return (
              <MDBCol md="4" key={taskId} className="mb-4">
                <MDBCard className="task-card h-100 border-0 shadow-sm">
                  <MDBCardBody className="d-flex flex-column p-4">
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
                          <Button size="sm" variant="dark" className="w-100" onClick={() => handleUpdate(taskId)}>Sačuvaj</Button>
                          <Button size="sm" variant="outline-dark" className="w-100" onClick={() => setEditingTask(null)}>Nazad</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between mb-3">
                          <MDBBadge className={`priority-badge ${(t.priority || t.Priority).toLowerCase()}`}>
                            {t.priority || t.Priority}
                          </MDBBadge>
                          <div className="d-flex gap-3">
                            <MDBIcon fas icon="pen" className="action-icon-edit" onClick={() => startEdit(t)} />
                            <MDBIcon fas icon="trash-alt" className="action-icon-delete" onClick={() => deleteTask(taskId)} />
                          </div>
                        </div>
                        <h5 className="fw-bold mb-2 task-title-text">{t.title || t.Title}</h5>
                        <p className="text-muted small flex-grow-1 mb-4">{t.description || t.Description}</p>
                        <div className="task-footer border-top pt-3 mt-auto">
                          <div className="small text-muted mb-1"><MDBIcon far icon="clock" className="me-2 text-warning"/>{formatDateTime(t.createdAt || t.CreatedAt)}</div>
                          <div className={`small mb-3 ${new Date(t.dueDate || t.DueDate) < new Date() ? 'text-danger fw-bold' : 'text-muted'}`}>
                            <MDBIcon far icon="calendar-times" className="me-2 text-warning"/>Rok: {formatDateTime(t.dueDate || t.DueDate)}
                          </div>
                          <button className="complete-btn" onClick={() => completeTask(taskId)}>Zavrsi Zadatak</button>
                        </div>
                      </>
                    )}
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            );
          })
        ) : (
          <div className="text-center w-100 py-5"><p className="text-muted">Trenutno nema aktivnih zadataka. Kreiraj jedan iznad!</p></div>
        )}
      </MDBRow>
      <ToastContainer position="bottom-right" theme="dark" limit={1} autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick pauseOnHover closeButton={false} />
    </MDBContainer>
  );
}

export default Tasks;