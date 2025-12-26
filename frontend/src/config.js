// Use environment variable for production, localhost for development
let API_URL = import.meta.env.VITE_API_URL;

// If no environment variable is set, determine URL based on hostname
if (!API_URL) {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        API_URL = 'http://localhost:5001';
    } else {
        // Fallback for deployed environment if VITE_API_URL is missing
        // Based on backend/render.yaml service name 'recipe-portal-backend'
        API_URL = 'https://recipe-portal-backend.onrender.com';
        console.warn('VITE_API_URL not set. Defaulting to:', API_URL);
    }
}
export const BACKEND_URL = API_URL;
export const API_BASE_URL = `${BACKEND_URL}/api`;
