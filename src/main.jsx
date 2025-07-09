// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// SỬA LỖI: Import các file CSS cần thiết
import './styles/global.css';      // 1. Reset và style chung
import './styles/variables.css';  // 2. Biến và class của Design System
import './styles/fonts.css';        // 3. fonts

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)