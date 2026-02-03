import axios from "axios";

// API base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://fayegoh1162340.pythonanywhere.com' 
    : 'http://localhost:5000');

// Create axios instance with default configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for session cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add any common headers
api.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            console.log('Unauthorized access');
        }
        return Promise.reject(error);
    }
);

export default api;

// login user

export const loginUser = async (loginData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData, {
            withCredentials: true, // <-- THIS IS CRITICAL!
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Received response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    }
}

// Register User
export const registerUser = async(userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.data
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message)
        // Ensure we're throwing the error with the response data for better error handling
        if (error.response?.data) {
            throw error
        } else {
            // If no response data, create a more informative error
            const enhancedError = new Error(error.message || 'Network error')
            enhancedError.response = { data: { error: 'Connection failed. Please try again.' } }
            throw enhancedError
        }
    }
}