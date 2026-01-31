import axios from 'axios';

// Kreiramo centralnu instancu. 
// baseURL znači da u ostalim fajlovima pišeš samo npr. "/User/Login"
const API = axios.create({
    baseURL: 'https://localhost:7248/api',
    withCredentials: true
});

let resetTimerCallback = null;

export const setResetTimerCallback = (callback) => {
    resetTimerCallback = callback;
};

// 1. Request Interceptor - Resetuje tajmer pri svakom SLANJU zahteva
API.interceptors.request.use(
    (config) => {
        if (resetTimerCallback) resetTimerCallback();
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Response Interceptor - Resetuje tajmer pri svakom PRIJEMU odgovora
API.interceptors.response.use(
    (response) => {
        if (resetTimerCallback) resetTimerCallback();
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            const path = window.location.pathname;
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