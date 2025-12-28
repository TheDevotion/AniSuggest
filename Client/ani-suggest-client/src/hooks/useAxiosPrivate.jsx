import { useEffect } from 'react';
import axios from 'axios';
import useAuth from './useAuth';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

// --- FIX: Create the instance OUTSIDE the hook so it stays stable ---
const axiosAuth = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

const useAxiosPrivate = () => {
    const { auth, setAuth } = useAuth();

    useEffect(() => {
        // 1. REQUEST INTERCEPTOR
        const requestIntercept = axiosAuth.interceptors.request.use(
            (config) => {
                // Attach token from auth state if it exists
                if (!config.headers['Authorization']) {
                    // Check for all possible token names
                    const token = auth?.token || auth?.Token || auth?.accessToken;
                    if (token) {
                        config.headers['Authorization'] = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // 2. RESPONSE INTERCEPTOR
        const responseIntercept = axiosAuth.interceptors.response.use(
            response => response,
            async (error) => {
                const originalRequest = error?.config;

                // If error is 401 and we haven't retried yet
                if (error?.response?.status === 401 && !originalRequest?._retry) {
                    originalRequest._retry = true;

                    try {
                        console.log("🔄 Local Refresh: Getting new token...");
                        
                        // Call refresh endpoint
                        const response = await axios.post(`${apiUrl}/refresh`, {}, {
                            withCredentials: true 
                        });

                        // Get new token (handle different capitalizations)
                        const newAccessToken = response.data.token || response.data.Token || response.data.accessToken;
                        const newRole = response.data.role || response.data.Role;

                        // Update State
                        setAuth(prev => {
                            console.log("✅ Token Refreshed!");
                            return { 
                                ...prev, 
                                token: newAccessToken, 
                                role: newRole || prev.role 
                            };
                        });

                        // Retry Original Request
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosAuth(originalRequest);

                    } catch (refreshError) {
                        console.error("❌ Session expired:", refreshError);
                        // Optional: logout user here
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        // Cleanup: Remove interceptors when component unmounts or auth changes
        return () => {
            axiosAuth.interceptors.request.eject(requestIntercept);
            axiosAuth.interceptors.response.eject(responseIntercept);
        }

    }, [auth, setAuth]);

    return axiosAuth;
}

export default useAxiosPrivate;