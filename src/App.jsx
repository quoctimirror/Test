// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes/AppRoutes";
import ErrorBoundary from "@components/errorBoundary/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import "@styles/fonts.css";
import "@styles/typography.css";
function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
