// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// FIX: Import necessary CSS files
import './styles/global.css';      // 1. Reset and common styles
import './styles/variables.css';  // 2. Variables and classes of Design System
import './styles/fonts.css';        // 3. fonts

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)