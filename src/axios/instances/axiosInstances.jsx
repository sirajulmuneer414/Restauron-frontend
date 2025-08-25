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

