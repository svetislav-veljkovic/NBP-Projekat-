import axios from 'axios';

const API = axios.create({
    baseURL: 'https://localhost:7248/api',
    withCredentials: true
});

let resetTimerCallback = null;

export const setResetTimerCallback = (callback) => {
    resetTimerCallback = callback;
};

// 1. Request Interceptor
API.interceptors.request.use(
    (config) => {
        if (resetTimerCallback) resetTimerCallback();
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Response Interceptor
API.interceptors.response.use(
    (response) => {
        if (resetTimerCallback) resetTimerCallback();
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            const path = window.location.pathname;
            // Preusmeravaj na login SAMO ako korisnik pokuša da pristupi zaštićenim stranicama
            // Ne preusmeravaj ako je na /, /login ili /register
            const publicPaths = ['/', '/login', '/register'];
            if (!publicPaths.includes(path)) {
                console.warn("Sesija nevalidna, preusmeravanje...");
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;