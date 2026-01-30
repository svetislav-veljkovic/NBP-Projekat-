import axios from 'axios';

const API = axios.create({
    baseURL: 'https://localhost:7248/api',
    withCredentials: true
});

let resetTimerCallback = null;

// Funkcija za registraciju callback-a iz Navbara
export const setResetTimerCallback = (callback) => {
    resetTimerCallback = callback;
};

// 1. PRESRETAČ ZA ZAHTEVE (Request Interceptor)
// Resetujemo tajmer čim korisnik POKUŠA nešto da uradi
API.interceptors.request.use(
    (config) => {
        if (resetTimerCallback) {
            resetTimerCallback();
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. PRESRETAČ ZA ODGOVORE (Response Interceptor)
// Resetujemo tajmer i kada server uspešno ODGOVORI
API.interceptors.response.use(
    (response) => {
        if (resetTimerCallback) {
            resetTimerCallback();
        }
        return response;
    },
    (error) => {
        // Ako je 401 (Unauthorized) i nismo već na login stranici
        if (error.response && error.response.status === 401) {
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;