import React, { useEffect, useState } from 'react';
import { MDBContainer, MDBCard, MDBCardBody, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import Axios from 'axios';

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
        <MDBContainer className="mt-5 pt-5">
            <MDBCard className="shadow-5 border-0" style={{borderRadius: '15px'}}>
                <MDBCardBody>
                    <h3 className="text-center mb-4">🏆 Globalna Rang Lista</h3>
                    <MDBTable hover borderless align='middle'>
                        <MDBTableHead className="table-dark">
                            <tr>
                                <th>Pozicija</th>
                                <th>Korisnik</th>
                                <th>Ukupno Poena</th>
                            </tr>
                        </MDBTableHead>
                        <MDBTableBody>
                            {leaders.map((user, index) => (
                                <tr key={index}>
                                    <td>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                    </td>
                                    <td><strong>@{user.key}</strong></td>
                                    <td>
                                        <span className="badge badge-success px-3 py-2" style={{fontSize: '0.85rem'}}>
                                            {user.value} pts
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </MDBTableBody>
                    </MDBTable>
                </MDBCardBody>
            </MDBCard>
        </MDBContainer>
    );
}

export default Scoreboard;