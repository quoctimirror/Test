import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { partnerPortalApi } from "@/services/podApi";
import "@/components/pod-admin/PodAdminLayout.css";

// Fix Leaflet default marker icon issue with bundlers (Vite/Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [41, 41],
});

// Component to control map view from outside
function MapController({ selectedPod, pods }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPod?.latitude && selectedPod?.longitude) {
      map.flyTo([selectedPod.latitude, selectedPod.longitude], 16, {
        duration: 1.2,
      });
    }
  }, [selectedPod, map]);

  // Fit bounds on initial load
  useEffect(() => {
    const podsWithCoords = pods.filter((p) => p.latitude && p.longitude);
    if (podsWithCoords.length > 0) {
      const bounds = L.latLngBounds(
        podsWithCoords.map((p) => [p.latitude, p.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pods, map]);

  return null;
}

export default function PartnerPortalPodLocations() {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPod, setSelectedPod] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPods();
  }, []);

  const fetchPods = async () => {
    try {
      setLoading(true);
      const response = await partnerPortalApi.getMyPods({ size: 100 });
      const podsData = response.data.content || [];
      setPods(podsData);

      const firstPodWithCoords = podsData.find((p) => p.latitude && p.longitude);
      if (firstPodWithCoords) {
        setSelectedPod(firstPodWithCoords);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching PODs:", err);
      setError("Failed to load your PODs");
    } finally {
      setLoading(false);
    }
  };

  const filteredPods = pods.filter((pod) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pod.name?.toLowerCase().includes(searchLower) ||
      pod.locationName?.toLowerCase().includes(searchLower) ||
      pod.city?.toLowerCase().includes(searchLower) ||
      pod.addressLine1?.toLowerCase().includes(searchLower)
    );
  });

  const podsWithCoords = useMemo(
    () => pods.filter((p) => p.latitude && p.longitude),
    [pods]
  );

  const handleViewOnMap = (pod) => {
    if (!pod.latitude || !pod.longitude) {
      alert("This POD does not have location coordinates");
      return;
    }
    setSelectedPod(pod);
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      DRAFT: "draft",
      ACTIVE: "active",
      MAINTENANCE: "maintenance",
      INACTIVE: "inactive",
    };
    return classes[status] || "";
  };

  // Default center: Ho Chi Minh City
  const defaultCenter = [10.8231, 106.6297];

  return (
    <div className="pod-page">
      <div className="pod-page-header">
        <h1 className="pod-page-title">POD Locations</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          View your Point of Display locations on the map
        </p>
      </div>

      {loading && (
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading your POD locations...</p>
        </div>
      )}

      {error && !loading && (
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button className="pod-btn pod-btn-primary" onClick={fetchPods}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "1.5rem", minHeight: "600px" }}>
          {/* Left Side - POD List */}
          <div className="pod-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
              <input
                type="text"
                className="pod-form-input"
                placeholder="Search POD by name, location, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              {filteredPods.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                  {searchTerm ? "No PODs match your search" : "No PODs found"}
                </div>
              ) : (
                filteredPods.map((pod) => (
                  <div
                    key={pod.id}
                    onClick={() => handleViewOnMap(pod)}
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid #e5e7eb",
                      cursor: "pointer",
                      background: selectedPod?.id === pod.id ? "#eff6ff" : "transparent",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedPod?.id !== pod.id) {
                        e.currentTarget.style.background = "#f9fafb";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPod?.id !== pod.id) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                          {pod.name}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                          {pod.locationName}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                          {pod.addressLine1 && `${pod.addressLine1}, `}
                          {pod.city}, {pod.country}
                        </div>
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(pod.status)}`} style={{ fontSize: "0.7rem" }}>
                        {pod.status}
                      </span>
                    </div>

                    <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
                      {pod.latitude && pod.longitude ? (
                        <span style={{ color: "#10b981" }}>
                          📍 {pod.latitude.toFixed(4)}, {pod.longitude.toFixed(4)}
                        </span>
                      ) : (
                        <span style={{ color: "#f59e0b" }}>
                          ⚠️ No coordinates
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #e5e7eb", background: "#f9fafb" }}>
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                {filteredPods.length} POD{filteredPods.length !== 1 ? "s" : ""} found
                {searchTerm && ` for "${searchTerm}"`}
              </div>
            </div>
          </div>

          {/* Right Side - Leaflet Map */}
          <div className="pod-card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
            {/* Selected POD Info Overlay */}
            {selectedPod && (
              <div style={{
                position: "absolute",
                top: "1rem",
                left: "1rem",
                right: "1rem",
                background: "white",
                padding: "1rem",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                zIndex: 1000,
              }}>
                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                  {selectedPod.name}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                  {selectedPod.locationName}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  {selectedPod.fullAddress || `${selectedPod.addressLine1 || ""}, ${selectedPod.city}, ${selectedPod.country}`}
                </div>
              </div>
            )}

            <MapContainer
              center={defaultCenter}
              zoom={12}
              style={{ width: "100%", height: "100%", minHeight: "550px" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController selectedPod={selectedPod} pods={pods} />

              {podsWithCoords.map((pod) => (
                <Marker
                  key={pod.id}
                  position={[pod.latitude, pod.longitude]}
                  icon={selectedPod?.id === pod.id ? selectedIcon : defaultIcon}
                  eventHandlers={{
                    click: () => setSelectedPod(pod),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: "190px" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95em", marginBottom: "4px" }}>
                        {pod.name}
                      </div>
                      <div style={{ fontSize: "0.85em", color: "#4b5563", marginBottom: "2px" }}>
                        {pod.locationName}
                      </div>
                      <div style={{ fontSize: "0.8em", color: "#9ca3af", marginBottom: "6px" }}>
                        {pod.addressLine1 && `${pod.addressLine1}, `}
                        {pod.city}, {pod.country}
                      </div>

                      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "6px", marginTop: "4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78em", marginBottom: "3px" }}>
                          <span style={{ color: "#6b7280" }}>Status</span>
                          <span style={{
                            fontWeight: 600,
                            color: pod.status === "ACTIVE" ? "#10b981"
                              : pod.status === "INACTIVE" ? "#ef4444"
                              : pod.status === "MAINTENANCE" ? "#f59e0b" : "#6b7280"
                          }}>{pod.status}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78em", marginBottom: "3px" }}>
                          <span style={{ color: "#6b7280" }}>Capacity</span>
                          <span>{pod.displayCapacity || "-"} products</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78em", marginBottom: "3px" }}>
                          <span style={{ color: "#6b7280" }}>Commission</span>
                          <span>{pod.commissionRate != null ? `${pod.commissionRate}%` : "Default"}</span>
                        </div>
                        {pod.installationDate && (
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78em", marginBottom: "3px" }}>
                            <span style={{ color: "#6b7280" }}>Installed</span>
                            <span>{pod.installationDate}</span>
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78em" }}>
                          <span style={{ color: "#6b7280" }}>Products</span>
                          <span>{pod.productCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {!loading && !error && pods.length === 0 && (
        <div className="pod-card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📍</div>
          <h3 style={{ marginBottom: "0.5rem" }}>No POD Locations</h3>
          <p style={{ color: "#6b7280" }}>
            You don't have any Point of Display units yet.<br />
            Contact admin to set up your first POD.
          </p>
        </div>
      )}
    </div>
  );
}
