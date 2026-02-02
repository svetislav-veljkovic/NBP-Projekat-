import React, { useEffect, useState, useCallback } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Axios from '../api';
import { MDBCard, MDBCardBody, MDBBtnGroup, MDBBtn } from 'mdb-react-ui-kit';
import '../styles/App.css';

function ProductivityChart() {
    const [data, setData] = useState([]);
    const [period, setPeriod] = useState('7days');

    const fetchData = useCallback(async () => {
        try {
            const res = await Axios.get(`/Task/ProductivityData?period=${period}`);
            setData(res.data);
        } catch (err) {
            console.error("Greska pri dohvatanju statistike:", err);
        }
    }, [period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <MDBCard className="custom-card mt-4 border-0 shadow-sm">
            <MDBCardBody>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="header m-0 productivity-header">
                        <div className="text">Produktivnost</div>
                        <div className="underline"></div>
                    </div>

                    <MDBBtnGroup shadow='0'>
                        <MDBBtn 
                            color={period === '7days' ? 'dark' : 'light'} 
                            onClick={() => setPeriod('7days')}
                            size="sm"
                        >
                            7 Dana
                        </MDBBtn>
                        <MDBBtn 
                            color={period === 'month' ? 'dark' : 'light'} 
                            onClick={() => setPeriod('month')}
                            size="sm"
                        >
                            Mesec
                        </MDBBtn>
                    </MDBBtnGroup>
                </div>
                
                <p className="text-center text-muted mb-4">
                    Prikaz zavrsenih zadataka za period: <strong>{period === '7days' ? 'Poslednjih 7 dana' : 'Poslednjih mesec dana'}</strong>
                </p>

                <div className="chart-container">
                    <ResponsiveContainer>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4c00b0" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#4c00b0" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#888', fontSize: 11}}
                            />
                            <YAxis 
                                allowDecimals={false} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#888', fontSize: 11}}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    borderRadius: '12px', 
                                    border: 'none', 
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                    backgroundColor: '#fff' 
                                }}
                                itemStyle={{ color: '#4c00b0', fontWeight: 'bold' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#4c00b0" 
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                                strokeWidth={4}
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </MDBCardBody>
        </MDBCard>
    );
}

export default ProductivityChart;