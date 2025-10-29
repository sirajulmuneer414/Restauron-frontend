import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = "http://localhost:8081";

// --- Interceptor Logic ---
const createAuthResponseInterceptor = (navigate) => async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
            const isCustomerRequest = originalRequest.baseURL?.includes('/customer');
            if (isCustomerRequest) {
                const encryptedId = Cookies.get('restaurantId');
                if (encryptedId) {
                    if (navigate) navigate(`/public/login/${encryptedId}`);
                    else window.location.href = `/public/login/${encryptedId}`;
                    return Promise.reject(error);
                }


            }
            if (navigate) navigate('/login');
            else window.location.href = '/login';
            return Promise.reject(error);
        }

        try {
            const response = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
            
            Cookies.set('accessToken', newAccessToken, { expires: 1/48 });
            if (newRefreshToken) {
                Cookies.set('refreshToken', newRefreshToken, { expires: 7 });
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);

        } catch (refreshError) {
            console.error("Refresh token failed:", refreshError);
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            
            const isCustomerRequest = originalRequest.baseURL?.includes('/customer');
            if (isCustomerRequest) {
                const encryptedId = Cookies.get('restaurantId');
                if (encryptedId) {
                    if (navigate) navigate(`/public/login/${encryptedId}`);
                    else window.location.href = `/public/login/${encryptedId}`;
                } else {
                    if (navigate) navigate('/login');
                    else window.location.href = '/login';
                }
            } else {
                if (navigate) navigate('/login');
                else window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
};

/**
 * Request interceptor to add the JWT token and Restaurant ID to headers.
 * Now includes '/customer' in the check for the restaurant ID.
 */
const authRequestInterceptor = (config) => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // Check if the request is for owner, employee, or customer endpoints
   
        const restaurantId = Cookies.get("restaurantId");
        if (restaurantId) {
            config.headers["X-Restaurant-Id"] = restaurantId;
        }

        const customerId = Cookies.get("customerId");
        if (customerId) {
            config.headers["X-Customer-Id"] = customerId;
        }
    
    return config;
};


// --- Create instances with fallback navigation ---
const createAuthInstance = (baseURL, navigate = null) => {
    const instance = axios.create({ 
        baseURL, 
        headers: { "Content-Type": "application/json" } 
    });
    instance.interceptors.request.use(authRequestInterceptor);
    instance.interceptors.response.use(
        response => response, 
        createAuthResponseInterceptor(navigate)
    );
    return instance;
};

// --- Direct Export Instances (for non-component usage) ---

export const axiosLoginInstance = axios.create({ 
    baseURL: `${BASE_URL}/auth/login`,
    headers: { "Content-Type": "application/json" }
});

export const axiosSignupInstance = axios.create({ 
    baseURL: `${BASE_URL}/registration`,
    headers: { "Content-Type": "application/json" }
});

// The createAuthInstance factory now correctly applies the modified interceptor
export const axiosOwnerInstance = createAuthInstance(`${BASE_URL}/owner`);
export const axiosAdminInstance = createAuthInstance(`${BASE_URL}/admin`);
export const axiosEmployeeInstance = createAuthInstance(`${BASE_URL}/employee`);
export const axiosCustomerInstance = createAuthInstance(`${BASE_URL}/customer`);
export const axiosInstances = createAuthInstance(BASE_URL);


// --- Hook for Components (with enhanced navigation) ---
export const useAxios = () => {
    const navigate = useNavigate();

    const instances = useMemo(() => ({
        axiosPublicInstance: createAuthInstance(`${BASE_URL}/public`, navigate),
        axiosLoginInstance,
        axiosSignupInstance,
        axiosOwnerInstance: createAuthInstance(`${BASE_URL}/owner`, navigate),
        axiosAdminInstance: createAuthInstance(`${BASE_URL}/admin`, navigate),
        axiosEmployeeInstance: createAuthInstance(`${BASE_URL}/employee`, navigate),
        axiosCustomerInstance: createAuthInstance(`${BASE_URL}/customer`, navigate),
        axiosInstances: createAuthInstance(BASE_URL, navigate),
    }), [navigate]);

    return instances;
};

