import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3000', // NestJS API
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('spaas_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});