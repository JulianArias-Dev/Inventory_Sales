import axios from "axios";

// Para desarrollo local (comenta esta línea cuando subas a Docker)
// const api = axios.create({
//     baseURL: "http://localhost:5000/api",
//     headers: {
//         "Content-Type": "application/json"
//     }
// });


// Para Docker
const api = axios.create({
    baseURL: "http://api:8080/api",
    headers: {
        "Content-Type": "application/json"
    }
});

export default api;