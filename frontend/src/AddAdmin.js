import { useState } from 'react';
import {ToastContainer, toast } from 'react-toastify';
import { useEffect } from 'react';
import Axios from 'axios';

function AddAdminPage() {

    const [userTypes, setUserTypes] = useState([]);
    const [user, setUser] = useState([]);
    const [value, setValue] = useState('');
    const [addId, setaddId] = useState(null);
    const [addUserId, setaddUserId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5105/api/UserType/Get', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        // Include any additional headers if needed
                    },
                    credentials: 'include',
                    mode: 'cors',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setUserTypes(data);
            } catch (error) {
                console.error('Error fetching user types:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5105/api/User/GetUsersbyTypeId?id=${addId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        // Include any additional headers if needed
                    },
                    credentials: 'include',
                    mode: 'cors',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        if (addId !== null) {
            fetchData();
        }
    }, [addId]);




    function handleSelect(event) {
        setValue(event.target.value);
        console.log(event.target.value);
        setaddId(parseInt(event.target.value)); // Update deleteId when value changes
    }

    function handleSelect1(event) {
        setaddUserId(parseInt(event.target.value));
        console.log(`Id of user is ${event.target.value}`)
    }

    function  submit(e) {
        e.preventDefault();
        const uri = `http://localhost:5105/api/User/GiveAdmin?id=${addUserId}`;
        try {
            const response =  fetch(uri, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                mode: 'cors',
            });


            toast.success('Admin Given!', {
                className: 'custom-toast',
                bodyClassName: 'custom-toast-body',
                autoClose: 3000,
            });
        } catch (error) {
            console.error('Error giving admin:', error);
            toast.error('Error giving admin', {
                className: 'custom-toast',
                bodyClassName: 'custom-toast-body',
                autoClose: 3000,
            });
        }
    };


    return (
        <>
            <form onSubmit={submit} className='container1'>
                <div className='header'>
                    <div className='text'>
                        Add admin to user
                    </div>
                    <div className='underline'></div>
                </div>
                <div className='selector' style={{ display: 'flex', gap: '1rem' }}>
                    <h4>Choose UserType </h4>
                    <select onChange={handleSelect}>
                        {userTypes.map(user => (
                            <option value={user.id}>{user.name}</option>
                        ))}
                    </select>
                    <h4>Choose user to give admin to</h4>
                    <select onChange={handleSelect1}>
                        {user.map(user => (
                            <option value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
                <button type='submit' submit="true" className='sign-in'>Add admin</button>
            </form>
            <ToastContainer />
        </>
    )
}

export default AddAdminPage;