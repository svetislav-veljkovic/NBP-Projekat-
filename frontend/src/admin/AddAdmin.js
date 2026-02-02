import React, { useState } from 'react';
import API from '../api';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Log-In.css';

function AddAdminPage() {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        const targetUser = username.trim().toLowerCase();

        if (!window.confirm(`Da li ste sigurni da zelite da korisniku "${targetUser}" dodelite ADMIN prava?`)) {
            return;
        }

        setIsLoading(true);
        try {
            await API.put(`/User/GiveAdmin?username=${targetUser}`);
            toast.success(`Korisnik "${targetUser}" je uspesno unapredjen u admina!`);
            setUsername('');
        } catch (error) {
            const errorMsg = error.response?.data || 'Greska prilikom dodele admin prava';
            toast.error(typeof errorMsg === 'string' ? errorMsg : "Akcija neuspesna.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='container1'>
            <form onSubmit={submit} className="w-100">
                <div className='header'>
                    <div className='text'>Admin Panel</div>
                    <div className='underline'></div>
                </div>

                <p className="admin-instruction-text">
                    Unesite korisnicko ime korisnika kojeg zelite da unapredite.
                </p>

                <div className='inputs admin-input-margin'>
                    <div className='input-group-custom'>
                        <input 
                            type='text' 
                            className='admin-input'
                            placeholder='Username korisnika...' 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <button 
                    type='submit' 
                    className={`sign-in ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'OBRADA...' : 'UNAPREDI U ADMINA'}
                </button>
            </form>
            <ToastContainer position="top-right" atheme="dark" limit={1} autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick pauseOnHover closeButton={false} />
        </div>
    );
}

export default AddAdminPage;