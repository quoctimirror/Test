import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function QrRedirect() {
  const { shortCode } = useParams();

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "";
    window.location.href = `${apiBase}/q/${shortCode}`;
  }, [shortCode]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Redirecting...</p>
    </div>
  );
}
