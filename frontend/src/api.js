import axios from 'axios';

// baseURL postavljen na tvoj HTTPS port, withCredentials obavezan za kolačiće
const API = axios.create({
    baseURL: 'https://localhost:7248/api', 
    withCredentials: true
});

let resetTimerCallback = null;

export const setResetTimerCallback = (callback) => {
    resetTimerCallback = callback;
};

// 1. Request Interceptor - Resetuje tajmer neaktivnosti pri svakom slanju
API.interceptors.request.use(
    (config) => {
        if (resetTimerCallback) resetTimerCallback();
        return config;
    },
    (error) => Promise.reject(error)
);

API.interceptors.response.use(
    (response) => {
        if (resetTimerCallback) resetTimerCallback();
        return response;
    },
    (error) => {
        // Ako je 401, samo prosledi grešku dalje, nemoj raditi window.location.href
        // To će omogućiti fetchUser-u u App.js da uđe u catch blok i postavi userId na -1
        if (error.response && error.response.status === 401) {
            console.warn("Sesija nije aktivna (401).");
        }
        return Promise.reject(error);
    }
);

export default API;