import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { podApi_pods, qrCodeApi } from "@/services/podApi";
import { ROUTES, getPodPartnerDetailRoute } from "@/constants/routes";
import "@/components/pod-admin/PodAdminLayout.css";

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function PodAdminPodDetail() {
  const { podId } = useParams();
  const navigate = useNavigate();
  const [pod, setPod] = useState(null);
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [searchingAddress, setSearchingAddress] = useState(false);

  useEffect(() => {
    fetchPodDetail();
    fetchQrCodes();
  }, [podId]);

  const fetchPodDetail = async () => {
    try {
      setLoading(true);
      const response = await podApi_pods.getDetail(podId);
      setPod(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching POD:", err);
      setError("Failed to load POD details");
    } finally {
      setLoading(false);
    }
  };

  const fetchQrCodes = async () => {
    try {
      const response = await qrCodeApi.getByPodId(podId);
      setQrCodes(response.data.content || response.data || []);
    } catch (err) {
      console.error("Error fetching QR codes:", err);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }
    try {
      await podApi_pods.updateStatus(podId, newStatus);
      fetchPodDetail();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this POD? This action cannot be undone.")) {
      return;
    }
    try {
      await podApi_pods.delete(podId);
      navigate(ROUTES.POD_ADMIN_PODS);
    } catch (err) {
      console.error("Error deleting POD:", err);
      alert("Failed to delete POD: " + (err.response?.data?.message || err.message));
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: pod.name || "",
      locationName: pod.locationName || "",
      addressLine1: pod.addressLine1 || "",
      addressLine2: pod.addressLine2 || "",
      city: pod.city || "",
      state: pod.state || "",
      postalCode: pod.postalCode || "",
      country: pod.country || "",
      latitude: pod.latitude ?? "",
      longitude: pod.longitude ?? "",
      displayCapacity: pod.displayCapacity || 10,
      commissionRate: pod.commissionRate ?? "",
      notes: pod.notes || "",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Search address and get coordinates using Nominatim (OpenStreetMap)
  const searchAddressCoordinates = async () => {
    const address = [
      editForm.addressLine1,
      editForm.city,
      editForm.state,
      editForm.country
    ].filter(Boolean).join(", ");

    if (!address || address === "Vietnam") {
      alert("Please enter an address first (Address Line 1 and City at minimum)");
      return;
    }

    try {
      setSearchingAddress(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        { headers: { "User-Agent": "MirrorDiamond-POD-System" } }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setEditForm((prev) => ({
          ...prev,
          latitude: parseFloat(lat).toFixed(6),
          longitude: parseFloat(lon).toFixed(6),
        }));
        alert(`Coordinates found!\nLatitude: ${lat}\nLongitude: ${lon}`);
      } else {
        alert("Could not find coordinates for this address. Please enter manually or try a different address.");
      }
    } catch (err) {
      console.error("Error searching address:", err);
      alert("Failed to search address. Please enter coordinates manually.");
    } finally {
      setSearchingAddress(false);
    }
  };


  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const submitData = {
        ...editForm,
        latitude: editForm.latitude !== "" ? parseFloat(editForm.latitude) : null,
        longitude: editForm.longitude !== "" ? parseFloat(editForm.longitude) : null,
        displayCapacity: parseInt(editForm.displayCapacity),
        commissionRate: editForm.commissionRate !== "" ? parseFloat(editForm.commissionRate) : null,
      };
      await podApi_pods.update(podId, submitData);
      setShowEditModal(false);
      fetchPodDetail();
    } catch (err) {
      console.error("Error updating POD:", err);
      alert("Failed to update POD: " + (err.response?.data?.message || err.message));
    } finally {
      setEditLoading(false);
    }
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

  const getQrStatusBadgeClass = (status) => {
    const classes = {
      ACTIVE: "active",
      INACTIVE: "inactive",
      EXPIRED: "expired",
    };
    return classes[status] || "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="pod-page">
        <div className="pod-loading">
          <div className="pod-loading-spinner" />
          <p>Loading POD details...</p>
        </div>
      </div>
    );
  }

  if (error || !pod) {
    return (
      <div className="pod-page">
        <div className="pod-card">
          <p style={{ color: "#ef4444" }}>{error || "POD not found"}</p>
          <Link to={ROUTES.POD_ADMIN_PODS} className="pod-btn pod-btn-primary">
            Back to PODs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pod-page">
      {/* Header */}
      <div className="pod-page-header">
        <div>
          <Link to={ROUTES.POD_ADMIN_PODS} style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to PODs
          </Link>
          <h1 className="pod-page-title" style={{ marginTop: "0.5rem" }}>
            {pod.name}
          </h1>
          <p style={{ color: "#6b7280", margin: 0 }}>{pod.id}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {pod.status === "DRAFT" && (
            <button className="pod-btn pod-btn-success" onClick={() => handleStatusUpdate("ACTIVE")}>
              Activate
            </button>
          )}
          {pod.status === "ACTIVE" && (
            <>
              <button className="pod-btn pod-btn-warning" onClick={() => handleStatusUpdate("MAINTENANCE")}>
                Maintenance
              </button>
              <button className="pod-btn pod-btn-danger" onClick={() => handleStatusUpdate("INACTIVE")}>
                Deactivate
              </button>
            </>
          )}
          {pod.status === "MAINTENANCE" && (
            <button className="pod-btn pod-btn-success" onClick={() => handleStatusUpdate("ACTIVE")}>
              Back to Active
            </button>
          )}
          {pod.status === "INACTIVE" && (
            <button className="pod-btn pod-btn-success" onClick={() => handleStatusUpdate("ACTIVE")}>
              Reactivate
            </button>
          )}
          <button className="pod-btn pod-btn-secondary" onClick={openEditModal}>
            Edit
          </button>
          <button className="pod-btn pod-btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="pod-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span className={`status-badge ${getStatusBadgeClass(pod.status)}`}>
            {pod.status}
          </span>
          <span style={{ color: "#6b7280" }}>
            Display Capacity: <strong>{pod.displayCapacity} products</strong>
          </span>
        </div>
      </div>

      {/* Statistics */}
      {(pod.totalScans !== undefined || pod.totalQrCodes !== undefined) && (
        <div className="pod-stats-grid" style={{ marginBottom: "1rem" }}>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{pod.totalQrCodes || 0}</div>
            <div className="pod-stat-label">QR Codes</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{pod.activeQrCodes || 0}</div>
            <div className="pod-stat-label">Active QR Codes</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{pod.totalScans || 0}</div>
            <div className="pod-stat-label">Total Scans</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{pod.uniqueScans || 0}</div>
            <div className="pod-stat-label">Unique Scans</div>
          </div>
          <div className="pod-stat-card">
            <div className="pod-stat-value">{pod.productsDisplayed || 0}</div>
            <div className="pod-stat-label">Products</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* POD Information */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            POD Information
          </h2>
          <div className="pod-detail-grid">
            <div className="pod-detail-item">
              <span className="pod-detail-label">POD Name</span>
              <span className="pod-detail-value">{pod.name}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Location Name</span>
              <span className="pod-detail-value">{pod.locationName}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Partner</span>
              <span className="pod-detail-value">
                {pod.partnerId && (
                  <Link to={getPodPartnerDetailRoute(pod.partnerId)} style={{ color: "#4f8cff" }}>
                    {pod.partnerBusinessName || pod.partnerId}
                  </Link>
                )}
              </span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Display Capacity</span>
              <span className="pod-detail-value">{pod.displayCapacity} products</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Commission Rate</span>
              <span className="pod-detail-value">
                {pod.commissionRate != null
                  ? `${pod.commissionRate}%`
                  : <span style={{ color: "#9ca3af" }}>Uses partner rate</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Location Address */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Location Address
          </h2>
          <div className="pod-detail-grid">
            <div className="pod-detail-item" style={{ gridColumn: "span 2" }}>
              <span className="pod-detail-label">Address</span>
              <span className="pod-detail-value">
                {[pod.addressLine1, pod.addressLine2].filter(Boolean).join(", ") || "-"}
              </span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">City</span>
              <span className="pod-detail-value">{pod.city || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">State/Province</span>
              <span className="pod-detail-value">{pod.state || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Postal Code</span>
              <span className="pod-detail-value">{pod.postalCode || "-"}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Country</span>
              <span className="pod-detail-value">{pod.country || "-"}</span>
            </div>
            <div className="pod-detail-item" style={{ gridColumn: "span 2" }}>
              <span className="pod-detail-label">Coordinates</span>
              <span className="pod-detail-value">
                {pod.latitude && pod.longitude ? (
                  <span style={{ color: "#10b981" }}>
                    📍 {Number(pod.latitude).toFixed(6)}, {Number(pod.longitude).toFixed(6)}
                  </span>
                ) : (
                  <span style={{ color: "#f59e0b" }}>
                    ⚠️ No coordinates set - edit to add map location
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Map Preview */}
          {pod.latitude && pod.longitude && (
            <div style={{ marginTop: "1rem" }}>
              <div style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                overflow: "hidden",
                height: "200px"
              }}>
                <MapContainer
                  center={[Number(pod.latitude), Number(pod.longitude)]}
                  zoom={16}
                  style={{ width: "100%", height: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[Number(pod.latitude), Number(pod.longitude)]}>
                    <Popup>{pod.name}<br />{pod.locationName}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Timeline
          </h2>
          <div className="pod-detail-grid">
            <div className="pod-detail-item">
              <span className="pod-detail-label">Created At</span>
              <span className="pod-detail-value">{formatDate(pod.createdAt)}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Updated At</span>
              <span className="pod-detail-value">{formatDate(pod.updatedAt)}</span>
            </div>
            <div className="pod-detail-item">
              <span className="pod-detail-label">Activated At</span>
              <span className="pod-detail-value">{formatDate(pod.activatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="pod-card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>
            Notes
          </h2>
          <p style={{ margin: 0, whiteSpace: "pre-wrap", color: pod.notes ? "#111827" : "#9ca3af" }}>
            {pod.notes || "No notes"}
          </p>
        </div>
      </div>

      {/* QR Codes Section */}
      <div className="pod-card" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
            QR Codes ({qrCodes.length})
          </h2>
          <Link to={ROUTES.POD_ADMIN_QRCODES} className="pod-btn pod-btn-primary pod-btn-sm">
            Manage QR Codes
          </Link>
        </div>

        {qrCodes.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No QR codes generated for this POD yet.</p>
        ) : (
          <div className="pod-table-container">
            <table className="pod-table">
              <thead>
                <tr>
                  <th>Short Code</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Scans</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {qrCodes.slice(0, 10).map((qr) => (
                  <tr key={qr.id}>
                    <td>
                      <code style={{ background: "#f3f4f6", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                        {qr.shortCode}
                      </code>
                    </td>
                    <td>{qr.productName || qr.productId}</td>
                    <td>
                      <span className={`status-badge ${getQrStatusBadgeClass(qr.status)}`}>
                        {qr.status}
                      </span>
                    </td>
                    <td>{qr.scanCount || 0}</td>
                    <td>{formatDate(qr.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {qrCodes.length > 10 && (
              <p style={{ textAlign: "center", color: "#6b7280", marginTop: "1rem" }}>
                Showing 10 of {qrCodes.length} QR codes.{" "}
                <Link to={ROUTES.POD_ADMIN_QRCODES} style={{ color: "#4f8cff" }}>
                  View all
                </Link>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="pod-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="pod-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="pod-modal-header">
              <h2>Edit POD</h2>
              <button className="pod-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="pod-modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <div className="pod-form-grid">
                  <div className="pod-form-group">
                    <label className="pod-form-label">POD Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="pod-form-input"
                      value={editForm.name}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="pod-form-group">
                    <label className="pod-form-label">Location Name *</label>
                    <input
                      type="text"
                      name="locationName"
                      className="pod-form-input"
                      value={editForm.locationName}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="pod-form-group">
                    <label className="pod-form-label">Display Capacity</label>
                    <input
                      type="number"
                      name="displayCapacity"
                      className="pod-form-input"
                      value={editForm.displayCapacity}
                      onChange={handleEditChange}
                      min="1"
                      max="100"
                    />
                  </div>
                  <div className="pod-form-group">
                    <label className="pod-form-label">Commission Rate (%)</label>
                    <input
                      type="number"
                      name="commissionRate"
                      className="pod-form-input"
                      value={editForm.commissionRate}
                      onChange={handleEditChange}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Leave empty to use partner rate"
                    />
                  </div>
                  <div className="pod-form-group" style={{ gridColumn: "span 2" }}>
                    <label className="pod-form-label">Address Line 1</label>
                    <input
                      type="text"
                      name="addressLine1"
                      className="pod-form-input"
                      value={editForm.addressLine1}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="pod-form-group" style={{ gridColumn: "span 2" }}>
                    <label className="pod-form-label">Address Line 2</label>
                    <input
                      type="text"
                      name="addressLine2"
                      className="pod-form-input"
                      value={editForm.addressLine2}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="pod-form-group">
                    <label className="pod-form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="pod-form-input"
                      value={editForm.city}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="pod-form-group">
                    <label className="pod-form-label">State/Province</label>
                    <input
                      type="text"
                      name="state"
                      className="pod-form-input"
                      value={editForm.state}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="pod-form-group">
                    <label className="pod-form-label">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      className="pod-form-input"
                      value={editForm.postalCode}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="pod-form-group">
                    <label className="pod-form-label">Country</label>
                    <input
                      type="text"
                      name="country"
                      className="pod-form-input"
                      value={editForm.country}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                {/* Map Coordinates Section */}
                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #e5e7eb" }}>
                  <h3 style={{ marginBottom: "1rem", fontSize: "1rem", fontWeight: 600 }}>
                    Map Coordinates
                  </h3>

                  <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "#fef3c7", borderRadius: "8px", border: "1px solid #fcd34d" }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#92400e" }}>
                      📍 Location coordinates are required to display this POD on the map.
                    </p>
                  </div>

                  <div className="pod-form-grid">
                    <div className="pod-form-group">
                      <label className="pod-form-label">Latitude</label>
                      <input
                        type="number"
                        name="latitude"
                        className="pod-form-input"
                        value={editForm.latitude}
                        onChange={handleEditChange}
                        step="0.000001"
                        placeholder="e.g., 10.762622"
                      />
                    </div>
                    <div className="pod-form-group">
                      <label className="pod-form-label">Longitude</label>
                      <input
                        type="number"
                        name="longitude"
                        className="pod-form-input"
                        value={editForm.longitude}
                        onChange={handleEditChange}
                        step="0.000001"
                        placeholder="e.g., 106.660172"
                      />
                    </div>
                    <div className="pod-form-group" style={{ gridColumn: "span 2" }}>
                      <button
                        type="button"
                        className="pod-btn pod-btn-secondary"
                        onClick={searchAddressCoordinates}
                        disabled={searchingAddress}
                        style={{ width: "100%" }}
                      >
                        {searchingAddress ? "Searching..." : "🔍 Search Coordinates from Address"}
                      </button>
                      <small style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.5rem", display: "block" }}>
                        Fill in the address fields above, then click this button to auto-fill coordinates
                      </small>
                    </div>
                  </div>

                  {/* Map Preview */}
                  <div style={{ marginTop: "1rem" }}>
                    <label className="pod-form-label">Map Preview</label>
                    <div style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      overflow: "hidden",
                      height: "200px",
                      position: "relative"
                    }}>
                      {editForm.latitude && editForm.longitude ? (
                        <MapContainer
                          key={`${editForm.latitude}-${editForm.longitude}`}
                          center={[parseFloat(editForm.latitude), parseFloat(editForm.longitude)]}
                          zoom={16}
                          style={{ width: "100%", height: "100%" }}
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[parseFloat(editForm.latitude), parseFloat(editForm.longitude)]} />
                        </MapContainer>
                      ) : (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          background: "#f3f4f6",
                          color: "#6b7280"
                        }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🗺️</div>
                            <p style={{ margin: 0 }}>Enter coordinates to preview location</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="pod-form-grid" style={{ marginTop: "1.5rem" }}>
                  <div className="pod-form-group" style={{ gridColumn: "span 2" }}>
                    <label className="pod-form-label">Notes</label>
                    <textarea
                      name="notes"
                      className="pod-form-input"
                      value={editForm.notes}
                      onChange={handleEditChange}
                      rows={3}
                      style={{ resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>
              <div className="pod-modal-footer">
                <button type="button" className="pod-btn pod-btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pod-btn pod-btn-primary" disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
