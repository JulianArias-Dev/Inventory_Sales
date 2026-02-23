import axios from "axios";

// Detectar si estamos en Docker (cuando no es localhost)
const isDocker = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// URL simple: en Docker usa el nombre del servicio, en local usa localhost
const API_URL = isDocker ? "http://api:8080/api" : "http://localhost:5000/api";

console.log('Conectando a:', API_URL); // Para saber en qué entorno estamos

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

export default api;