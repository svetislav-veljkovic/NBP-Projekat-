import React, { useState } from 'react';
import API from '../api';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Log-In.css';

function AddAdminPage() {
    const [username, setUsername] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        const targetUser = username.trim();

        try {
            // Slanje PUT zahteva na backend
            // Backend treba da osveži 'role' claim u bazi i sesiji
            await API.put(`/User/GiveAdmin?username=${targetUser}`);
            
            toast.success(`Korisnik "${targetUser}" je uspešno unapređen u admina!`);
            setUsername('');
        } catch (error) {
            // Hvatanje specifičnog odgovora sa servera (npr. ako korisnik ne postoji)
            const errorMsg = error.response?.data || 'Greška prilikom dodele admin prava';
            toast.error(typeof errorMsg === 'string' ? errorMsg : "Akcija neuspešna.");
        }
    };

    return (
        <div className='container1'>
            <form onSubmit={submit} className="w-100">
                <div className='header'>
                    <div className='text'>Dodaj Admina</div>
                    <div className='underline'></div>
                </div>

                <p className="text-center text-muted mt-3 px-4">
                    Pažljivo unesite korisničko ime. Novi admin će imati pun pristup upravljanju korisnicima.
                </p>

                <div className='inputs'>
                    <div className='input-group-custom'>
                        <input 
                            type='text' 
                            placeholder='Unesite username...' 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            style={{ padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>
                </div>

                <button type='submit' className='sign-in' style={{ marginTop: '20px' }}>
                    UNAPREDI U ADMINA
                </button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default AddAdminPage;