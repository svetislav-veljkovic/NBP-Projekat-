import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBCard, MDBCardBody, MDBTable, MDBTableHead, MDBTableBody, MDBBadge } from 'mdb-react-ui-kit';
import API from '../api'; 
import '../styles/Scoreboard.css';
import '../styles/App.css'; 

function Scoreboard({ username }) {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaders = async () => {
        try {
            const res = await API.get("/Task/Leaderboard");
            setLeaders(res.data);
        } catch (err) {
            console.error("Greska pri ucitavanju rang liste", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaders();
        const interval = setInterval(fetchLeaders, 60000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <MDBContainer className="mt-5 pt-5 pb-5">
            <div className='header mb-5'>
                <div className='text'>Globalna Rang Lista</div>
                <div className='underline'></div>
            </div>

            <MDBCard className="custom-card border-0 shadow-lg overflow-hidden">
                <MDBCardBody className="p-0"> 
                    <MDBTable hover borderless align='middle' className="mb-0 custom-table">
                        <MDBTableHead className="table-dark-header">
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
                                        <div className="spinner-border text-warning" role="status"></div>
                                    </td>
                                </tr>
                            ) : leaders.map((user, index) => (
                                <tr 
                                    key={index} 
                                    className={user.key === username ? "my-rank-row" : "rank-row"}
                                >
                                    <td className="ps-4">
                                        <div className={`rank-circle ${index < 3 ? `top-${index + 1}` : ''}`}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <span className="user-name-text">@{user.key}</span>
                                            {user.key === username && (
                                                <MDBBadge color='warning' className='ms-2 text-dark'>TI</MDBBadge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className="points-text">
                                            {user.value.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <MDBBadge pill className={index < 3 ? 'badge-elite' : 'badge-active'}>
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
                    Poeni se dodeljuju automatski nakon zavrsetka zadatka u zavisnosti od njegovog prioriteta.
                </p>
            </div>
        </MDBContainer>
    );
}

export default Scoreboard;