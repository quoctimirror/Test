// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import './styles/fonts.css'
import './styles/typography.css'
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
