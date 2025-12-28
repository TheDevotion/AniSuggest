import { useEffect } from 'react';
import axios from 'axios';
import useAuth from './useAuth';

// 1. Get the local URL
const apiUrl = import.meta.env.VITE_API_BASE_URL;

const useAxiosPrivate = () => {
    const { auth, setAuth } = useAuth();

    // 2. Create a separate instance for private requests
    const axiosAuth = axios.create({
        baseURL: apiUrl,
        withCredentials: true, // This allows the 'refresh_token' cookie to be sent
        headers: { 'Content-Type': 'application/json' }
    });

    useEffect(() => {
        // ---------------------------------------------------------
        // REQUEST INTERCEPTOR: Attaches the token you have to the header
        // ---------------------------------------------------------
        const requestIntercept = axiosAuth.interceptors.request.use(
            (config) => {
                // If the Authorization header is missing, add it
                if (!config.headers['Authorization']) {
                   if (auth?.token || auth?.Token || auth?.accessToken) {
    const tokenToUse = auth?.token || auth?.Token || auth?.accessToken;
    config.headers['Authorization'] = `Bearer ${tokenToUse}`;
}
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // ---------------------------------------------------------
        // RESPONSE INTERCEPTOR: Handles the Retry when Token Expires
        // ---------------------------------------------------------
        const responseIntercept = axiosAuth.interceptors.response.use(
            response => response,
            async (error) => {
                const originalRequest = error?.config;

                // If error is 401 (Unauthorized) and we haven't retried yet
                if (error?.response?.status === 401 && !originalRequest?._retry) {
                    originalRequest._retry = true; // Mark as retried

                    try {
                        console.log("🔄 Local Refresh: Getting new token...");
                        
                        // Call your backend refresh endpoint
                        // We use the base 'axios' here to avoid infinite loops
                        const response = await axios.post(`${apiUrl}/refresh`, {}, {
                            withCredentials: true 
                        });

                        // debugging to check what we get from backend.
                        console.log("🔥 FULL BACKEND RESPONSE DATA:", response.data);

                        // Check for "token", "Token", or "accessToken"
const newAccessToken = response.data.token || response.data.Token || response.data.accessToken;

// Debug log to confirm we found it
console.log("Extracted New Token:", newAccessToken);
                        
                        // Update the React State with the new token
                       setAuth(prev => {
    console.log("✅ Token Refreshed!");
    console.log("New Token from Backend:", newAccessToken); // Debug check

    return { 
        ...prev, 
        // 1. Keep the new token (if it exists), otherwise keep the old one
        token: newAccessToken || prev.token,
        
        // 2. IMPORTANT: Keep the OLD role if the backend didn't send a new one
        role: response.data.role || prev.role,

        // 3. Ensure other fields like user_id stick around too
        user_id: prev.user_id,
        first_name: prev.first_name
    };
});

                        // Update the FAILED request with the new token and retry it
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosAuth(originalRequest);

                    } catch (refreshError) {
                        console.error("❌ Session expired:", refreshError);
                        setAuth({}); // Log user out if refresh fails
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        // Cleanup
        return () => {
            axiosAuth.interceptors.request.eject(requestIntercept);
            axiosAuth.interceptors.response.eject(responseIntercept);
        }

    }, [auth, setAuth]);

    return axiosAuth;
}

export default useAxiosPrivate;