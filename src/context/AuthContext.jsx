// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { remoteApi } from '../api/axiosConfig'; // <-- SỬ DỤNG REMOTE API CHO AUTH

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = async (username, password) => {
        const response = await remoteApi.post('/api/v1/auth/authenticate', { username, password });

        // SỬA LỖI Ở ĐÂY: Dùng đúng tên biến
        const { accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        const userProfileResponse = await remoteApi.get('/api/v1/users/me');
        setUser(userProfileResponse.data);
        return userProfileResponse.data;
    };

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
    }, []);

    useEffect(() => {
        const verifyUser = async () => {
            if (localStorage.getItem('accessToken')) {
                try {
                    const response = await remoteApi.get('/api/v1/users/me');
                    setUser(response.data);
                } catch (error) {
                    // Interceptor đã tự động logout nếu cần
                    console.error("Failed to verify user session.", error);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        verifyUser();
    }, []);

    const value = {
        user,
        setUser,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};