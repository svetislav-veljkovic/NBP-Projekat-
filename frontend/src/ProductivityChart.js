import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Axios from 'axios';
import { MDBCard, MDBCardBody } from 'mdb-react-ui-kit';

function ProductivityChart() {
    const [data, setData] = useState([]);

    useEffect(() => {
        Axios.get("https://localhost:7248/api/Task/ProductivityData", { withCredentials: true })
            .then(res => setData(res.data))
            .catch(err => console.error("Greška pri dohvatanju podataka za grafikon", err));
    }, []);

    return (
        <MDBCard className="shadow-5 border-0 mt-4" style={{ borderRadius: '15px' }}>
            <MDBCardBody>
                <h4 className="text-center mb-4">📈 Tvoja produktivnost (Završeni zadaci)</h4>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="count" stroke="#000" fill="#e0e0e0" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </MDBCardBody>
        </MDBCard>
    );
}

export default ProductivityChart;