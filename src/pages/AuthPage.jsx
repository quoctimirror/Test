import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const AuthPage = () => {
    // State để quyết định hiển thị form nào. Mặc định là Login.
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (location.pathname === '/auth') {
            navigate('/auth/login', { replace: true });
        }
    }, [location, navigate]);

    return (
        <div>
            <Outlet />
        </div>
    );
};

export default AuthPage;