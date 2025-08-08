// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes/AppRoutes";
import ErrorBoundary from "@components/errorBoundary/ErrorBoundary";
import "@styles/fonts.css";
import "@styles/typography.css";
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
