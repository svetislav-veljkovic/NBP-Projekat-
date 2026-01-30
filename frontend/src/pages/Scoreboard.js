import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBCard, MDBCardBody, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import Axios from '../api';
import '../styles/Scoreboard.css';
import '../styles/App.css'; // Zbog .header i .custom-card

function Scoreboard() {
    const [leaders, setLeaders] = useState([]);
    const url = "https://localhost:7248/api/Task/Leaderboard";

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const res = await Axios.get(url);
                setLeaders(res.data);
            } catch (err) {
                console.error("Greška pri učitavanju rang liste", err);
            }
        };
        fetchLeaders();
    }, []);

    return (
        <MDBContainer className="mt-5 pt-5 pb-5">
            {/* Naslov sekcije */}
            <div className='header mb-5'>
                <div className='text'>Globalna Rang Lista</div>
                <div className='underline'></div>
            </div>

            <MDBCard className="custom-card border-0">
                <MDBCardBody className="p-0 overflow-hidden"> 
                    {/* p-0 da bi tabela išla od ivice do ivice unutar kartice */}
                    <MDBTable hover borderless align='middle' className="mb-0 custom-table">
                        <MDBTableHead>
                            <tr>
                                <th className="ps-4">Pozicija</th>
                                <th>Korisnik</th>
                                <th className="text-center">Ukupno Poena</th>
                            </tr>
                        </MDBTableHead>
                        <MDBTableBody>
                            {leaders.map((user, index) => (
                                <tr key={index} className={index < 3 ? `top-rank-${index + 1}` : ""}>
                                    <td className="ps-4">
                                        <div className="rank-badge">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <span className="user-name">@{user.key}</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`points-badge ${index < 3 ? 'gold-glow' : ''}`}>
                                            {user.value} <small>pts</small>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </MDBTableBody>
                    </MDBTable>
                    {leaders.length === 0 && (
                        <div className="text-center p-5">
                            <p className="text-muted">Trenutno nema podataka na rang listi...</p>
                        </div>
                    )}
                </MDBCardBody>
            </MDBCard>
        </MDBContainer>
    );
}

export default Scoreboard;