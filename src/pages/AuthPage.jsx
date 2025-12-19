import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const AuthPage = () => {
    // State để quyết định hiển thị form nào. Mặc định là Login.
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (location.pathname === ROUTES.AUTH) {
            navigate(ROUTES.AUTH_LOGIN, { replace: true });
        }
    }, [location, navigate]);

    return (
        <div>
            <Outlet />
        </div>
    );
};

export default AuthPage;