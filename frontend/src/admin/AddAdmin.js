import React, { useState } from 'react';
import API from '../api';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/Log-In.css';

function AddAdminPage() {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        
        // Backend očekuje mala slova zbog konzistentnosti
        const targetUser = username.trim().toLowerCase();

        if (!window.confirm(`Da li ste sigurni da želite da korisniku "${targetUser}" dodelite ADMIN prava?`)) {
            return;
        }

        setIsLoading(true);
        try {
            // PUT zahtev na /User/GiveAdmin?username=...
            await API.put(`/User/GiveAdmin?username=${targetUser}`);
            
            toast.success(`Korisnik "${targetUser}" je uspešno unapređen u admina!`);
            setUsername('');
        } catch (error) {
            // Ispisujemo grešku koju je backend bacio (npr. "Korisnik ne postoji")
            const errorMsg = error.response?.data || 'Greška prilikom dodele admin prava';
            toast.error(typeof errorMsg === 'string' ? errorMsg : "Akcija neuspešna.");
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

                <p className="text-center text-muted mt-3 px-4">
                    Unesite korisničko ime korisnika kojeg želite da unapredite. 
                   
                </p>

                <div className='inputs' style={{ marginTop: '20px' }}>
                    <div className='input-group-custom'>
                        <input 
                            type='text' 
                            placeholder='Username korisnika...' 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            disabled={isLoading}
                            style={{ 
                                padding: '15px', 
                                width: '100%', 
                                borderRadius: '8px', 
                                border: '1px solid #ddd',
                                fontSize: '16px'
                            }}
                        />
                    </div>
                </div>

                <button 
                    type='submit' 
                    className='sign-in' 
                    disabled={isLoading}
                    style={{ 
                        marginTop: '30px', 
                        backgroundColor: isLoading ? '#ccc' : '#4c00b0',
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? 'OBRADA...' : 'UNAPREDI U ADMINA'}
                </button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default AddAdminPage;