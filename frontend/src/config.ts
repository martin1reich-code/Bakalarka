export default {
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
    statusBackendUrl: import.meta.env.VITE_STATUS_BACKEND_URL || 'http://localhost:3003',
    userServiceUrl: 'http://localhost:5002',
    tripServiceUrl: 'http://localhost:5003'
}