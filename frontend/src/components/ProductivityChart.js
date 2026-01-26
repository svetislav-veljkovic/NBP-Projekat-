import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Axios from 'axios';
import { MDBCard, MDBCardBody } from 'mdb-react-ui-kit';
import '../styles/App.css'; // Koristimo globalni CSS

function ProductivityChart() {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Obavezno proveri da li je bekend URL tačan
        Axios.get("https://localhost:7248/api/Task/ProductivityData", { withCredentials: true })
            .then(res => setData(res.data))
            .catch(err => console.error("Greška pri dohvatanju podataka:", err));
    }, []);

    return (
        /* Koristimo custom-card klasu iz App.css */
        <MDBCard className="custom-card mt-4 border-0">
            <MDBCardBody>
                <div className="header mb-4">
                    <div className="text" style={{fontSize: '24px'}}>Produktivnost</div>
                    <div className="underline"></div>
                </div>
                
                <p className="text-center text-muted mb-4">Pregled završenih zadataka po danima</p>

                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2B3035" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#2B3035" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#666', fontSize: 12}}
                            />
                            <YAxis 
                                allowDecimals={false} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#666', fontSize: 12}}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#2B3035" 
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                                strokeWidth={3} 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </MDBCardBody>
        </MDBCard>
    );
}

export default ProductivityChart;