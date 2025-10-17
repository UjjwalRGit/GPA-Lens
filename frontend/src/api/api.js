import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect on 401 if the user is already authenticated
        // and it's not a login request
        if (error.response?.status === 401 && 
            !error.config?.url?.includes('/login') && 
            localStorage.getItem('token')) {
            
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Use React Router navigation instead of window.location
            // This will be handled by the components themselves
            console.warn('Session expired, please log in again');
        }
        return Promise.reject(error);
    }
);

export default api;