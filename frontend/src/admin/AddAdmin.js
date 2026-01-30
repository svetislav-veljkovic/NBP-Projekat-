import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import API from '../api'; // Koristimo tvoj import API
import '../styles/Log-In.css'; 

function AddAdminPage() {
    const [username, setUsername] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        try {
            // API već ima baseURL https://localhost:7248/api
            await API.put(`/User/GiveAdmin?username=${username}`);
            toast.success(`Korisnik ${username} je sada admin!`);
            setUsername('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Greška prilikom dodele admin prava');
        }
    };

    return (
        <div className='container1'>
            <form onSubmit={submit} className="w-100">
                <div className='header'>
                    <div className='text'>Dodaj Admina</div>
                    <div className='underline'></div>
                </div>

                <div className='inputs'>
                    <div className='input-group-custom'>
                        <input 
                            type='text' 
                            placeholder='Unesite username...' 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                </div>

                <button type='submit' className='sign-in'>
                    UNAPREDI U ADMINA
                </button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default AddAdminPage;