import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBCard, MDBCardBody, MDBTable, MDBTableHead, MDBTableBody, MDBBadge } from 'mdb-react-ui-kit';
import API from '../api'; 
import '../styles/Scoreboard.css';
import '../styles/App.css'; 

function Scoreboard({ username }) { // Primamo trenutni username kao prop
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const res = await API.get("/Task/Leaderboard");
                setLeaders(res.data);
            } catch (err) {
                console.error("Greška pri učitavanju rang liste", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaders();
    }, []);

    return (
        <MDBContainer className="mt-5 pt-5 pb-5">
            <div className='header mb-5'>
                <div className='text'>Globalna Rang Lista</div>
                <div className='underline'></div>
            </div>

            <MDBCard className="custom-card border-0 shadow-lg">
                <MDBCardBody className="p-0 overflow-hidden"> 
                    <MDBTable hover borderless align='middle' className="mb-0">
                        <MDBTableHead dark className="bg-dark text-white">
                            <tr>
                                <th className="ps-4 py-3">#</th>
                                <th className="py-3">Korisnik</th>
                                <th className="text-center py-3">Ukupno Poena</th>
                                <th className="text-center py-3">Status</th>
                            </tr>
                        </MDBTableHead>
                        <MDBTableBody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </td>
                                </tr>
                            ) : leaders.map((user, index) => (
                                <tr 
                                    key={index} 
                                    className={user.key === username ? "table-warning fw-bold shadow-sm" : ""}
                                    style={{ transition: 'all 0.3s ease' }}
                                >
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center justify-content-center bg-light rounded-circle fw-bold" 
                                             style={{ width: '35px', height: '35px', fontSize: '0.9rem' }}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <span className="user-name">@{user.key}</span>
                                            {user.key === username && (
                                                <MDBBadge color='info' className='ms-2'>TI</MDBBadge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`fw-bold ${index < 3 ? 'text-primary' : 'text-dark'}`} style={{fontSize: '1.1rem'}}>
                                            {user.value.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <MDBBadge pill color={index < 3 ? 'success' : 'secondary'} light>
                                            {index < 3 ? 'Elite' : 'Active'}
                                        </MDBBadge>
                                    </td>
                                </tr>
                            ))}
                        </MDBTableBody>
                    </MDBTable>
                    
                    {!loading && leaders.length === 0 && (
                        <div className="text-center p-5">
                            <p className="text-muted mb-0">Rang lista je trenutno prazna. Budi prvi koji će osvojiti poene!</p>
                        </div>
                    )}
                </MDBCardBody>
            </MDBCard>

            <div className="mt-4 text-center">
                <p className="text-muted small">
                    <i className="fas fa-info-circle me-1"></i> 
                    Poeni se dodeljuju automatski nakon završetka zadatka u zavisnosti od njegovog prioriteta.
                </p>
            </div>
        </MDBContainer>
    );
}

export default Scoreboard;