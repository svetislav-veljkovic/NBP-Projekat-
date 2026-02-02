import axios from 'axios';


const API = axios.create({
    baseURL: 'https://localhost:7248/api', 
    withCredentials: true
});

let resetTimerCallback = null;

export const setResetTimerCallback = (callback) => {
    resetTimerCallback = callback;
};


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

        if (error.response && error.response.status === 401) {
            console.warn("Sesija nije aktivna (401).");
        }
        return Promise.reject(error);
    }
);

export default API;