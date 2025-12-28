import axios from 'axios';

// Ensure this matches your backend URL exactly
const API_BASE_URL = 'http://localhost:8080'; 

const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial: Sends the HttpOnly cookie for refresh
});

// 1. REQUEST INTERCEPTOR (Uncommented and Fixed)
// This attaches the CURRENT token from localStorage to every request
axiosPrivate.interceptors.request.use(
  (config) => {
    // Get user from storage
    const userString = localStorage.getItem('user'); 
    
    if (userString) {
      const user = JSON.parse(userString);
      // If we have a token, attach it
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. RESPONSE INTERCEPTOR (The Fix for the Loop)
// This catches 401 errors, gets a new token, and retries the request
axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
        const prevRequest = error.config;

        // If error is 401 (Unauthorized) and we haven't retried yet
        if (error.response?.status === 401 && !prevRequest._retry) {
            prevRequest._retry = true; // Mark as retried

            try {
                // Call the refresh endpoint
                // We use 'axios' (global) or a new instance to avoid infinite loops with axiosPrivate interceptors
                const response = await axios.post(`${API_BASE_URL}/refresh`, {}, {
                    withCredentials: true 
                });

                // Get the new token from backend response
                const newToken = response.data.token; 
                const newRefreshToken = response.data.refreshToken; 

                // IMPORTANT: Update LocalStorage so future requests use the new token
                const userString = localStorage.getItem('user');
                if (userString) {
                    const user = JSON.parse(userString);
                    user.token = newToken;
                    if (newRefreshToken) user.refreshToken = newRefreshToken;
                    localStorage.setItem('user', JSON.stringify(user));
                }

                // Update the header of the failed request and retry it
                prevRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosPrivate(prevRequest);

            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                // Optional: Logout user if refresh completely fails
                // localStorage.removeItem('user');
                // window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosPrivate;