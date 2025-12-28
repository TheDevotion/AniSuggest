import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080', // Make sure this matches your backend
    withCredentials: true // Crucial for cookies
});

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retried to avoid infinite loop

            try {
                // 1. Call the refresh endpoint
                const response = await axios.post('http://localhost:8080/refresh', {}, {
                    withCredentials: true // Send the cookie containing the refresh token
                });

                // 2. Get the new token from response
                const newToken = response.data.token; 

                // 3. IMPORTANT: Update the header of the FAILED request with the NEW token
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                
                // 4. Also update the default header for future requests
                axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

                // 5. Retry the original request with the new token
                return axiosClient(originalRequest);

            } catch (refreshError) {
                console.error("Refresh token failed", refreshError);
                // Optional: Logout user if refresh fails
                // window.location.href = '/login'; 
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;