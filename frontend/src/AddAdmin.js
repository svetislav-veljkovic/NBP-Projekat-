import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Axios from 'axios';

function AddAdminPage() {
    const [username, setUsername] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        // Koristimo tvoj novi port 7248 i query parametar 'username'
        const uri = `https://localhost:7248/api/User/GiveAdmin?username=${username}`;

        try {
            await Axios.put(uri, {}, { withCredentials: true });

            toast.success(`Korisnik ${username} je sada admin!`, {
                autoClose: 3000,
            });
            setUsername('');
        } catch (error) {
            console.error('Error giving admin:', error);
            toast.error(error.response?.data || 'Greška prilikom dodele admin prava');
        }
    };

    return (
        <>
            <form onSubmit={submit} className='container1' style={{marginTop: '100px'}}>
                <div className='header'>
                    <div className='text'>Dodaj Admin Prava</div>
                    <div className='underline'></div>
                </div>
                
                <div className='inputs' style={{marginTop: '20px'}}>
                    <div className='input'>
                        <input 
                            type='text' 
                            placeholder='Unesite username korisnika' 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                </div>

                <button type='submit' className='sign-in'>Unapredi u Admina</button>
            </form>
            <ToastContainer />
        </>
    );
}

export default AddAdminPage;