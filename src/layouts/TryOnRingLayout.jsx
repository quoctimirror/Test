// src/layouts/ARLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
const TryOnRingLayout = () => {
    return (
        <main style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, background: '#1a1a1a' }}>
            <Outlet />
        </main>
    );
};

export default TryOnRingLayout;