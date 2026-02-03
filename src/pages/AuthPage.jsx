import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const AuthPage = () => {
    // State to decide which form to display. Default is Login.
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