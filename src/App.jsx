// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
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
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
