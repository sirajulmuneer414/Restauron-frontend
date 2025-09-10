import axios from "axios";
import Cookies from "js-cookie";

export const axiosInstances = axios.create({
    baseURL: "http://localhost:8081",
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
});

export const axiosSignupInstance = axios.create({
    baseURL: "http://localhost:8081/registration",
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
});

export const axiosOwnerInstance = axios.create({
    baseURL: "http://localhost:8081/owner",
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",

    },
});

export const axiosPublicInstance = axios.create({
    baseURL: "http://localhost:8081/public",
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
});


export const axiosLoginInstance = axios.create({
    baseURL: "http://localhost:8081/auth/login",
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
});

export const axiosAdminInstance = axios.create({
    baseURL: "http://localhost:8081/admin",
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
    withCredentials: true
});

export const axiosEmployeeInstance = axios.create({
    baseURL: "http://localhost:8081/employee",
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
    withCredentials: true
});

export const axiosCustomerInstance = axios.create({
    baseURL: "http://localhost:8081/customer",
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
    withCredentials: true
});


axiosOwnerInstance.interceptors.request.use((config) => {
    const token = Cookies.get("jwtToken");
    const restaruantId = Cookies.get("restaurantId");

    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    if(restaruantId) {
        config.headers["X-Restaurant-Id"] = restaruantId;
    }


    return config;
})
axiosPublicInstance.interceptors.request.use((config) => {
    const token = Cookies.get("jwtToken");
    const restaruantId = Cookies.get("restaurantId");
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if(restaruantId) {
        config.headers["X-Restaurant-Id"] = restaruantId;
    }
    return config;
})

axiosInstances.interceptors.request.use((config) => {
    const token = Cookies.get("jwtToken");

    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})


axiosAdminInstance.interceptors.request.use((config) => {
    const token = Cookies.get("jwtToken");

    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config;
})

axiosEmployeeInstance.interceptors.request.use((config) => {
    const token = Cookies.get("jwtToken");
    const restaruantId = Cookies.get("restaurantId");
    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    if(restaruantId) {
        config.headers["X-Restaurant-Id"] = restaruantId;
    }
    return config;
})

axiosCustomerInstance.interceptors.request.use((config) => {
    const token = Cookies.get("jwtToken");

    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
})