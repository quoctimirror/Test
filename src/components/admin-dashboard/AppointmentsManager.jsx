import React, { useState, useEffect } from "react";
import { appointmentsAPI, locationsAPI, handleAPIError } from "@services/api";

const AppointmentsManager = () => {
  const [appointments, setAppointments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [staffNotes, setStaffNotes] = useState("");

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "NO_SHOW", label: "No Show" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, locationsRes] = await Promise.all([
        appointmentsAPI.getAll(),
        locationsAPI.getAll(),
      ]);
      setAppointments(appointmentsRes.data || []);
      setLocations(locationsRes.data || []);
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to load appointments");
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const getVenueName = (venueId) => {
    const venue = locations.find((l) => l.id === venueId);
    return venue?.name || "Unknown Venue";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" };
      case "CONFIRMED":
        return { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" };
      case "COMPLETED":
        return { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" };
      case "CANCELLED":
        return { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" };
      case "NO_SHOW":
        return { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" };
      default:
        return { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setStaffNotes(appointment.staffNotes || "");
    setIsDetailModalOpen(true);
  };

  const handleConfirm = async (id) => {
    try {
      await appointmentsAPI.confirm(id);
      await fetchData();
      setIsDetailModalOpen(false);
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to confirm appointment");
      setError(errorInfo.message);
    }
  };

  const handleComplete = async (id) => {
    try {
      await appointmentsAPI.complete(id);
      await fetchData();
      setIsDetailModalOpen(false);
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to complete appointment");
      setError(errorInfo.message);
    }
  };

  const handleOpenCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    try {
      await appointmentsAPI.cancel(selectedAppointment.id, cancelReason);
      await fetchData();
      setIsCancelModalOpen(false);
      setIsDetailModalOpen(false);
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to cancel appointment");
      setError(errorInfo.message);
    }
  };

  const handleMarkNoShow = async (id) => {
    if (!window.confirm("Mark this appointment as No Show?")) return;
    try {
      await appointmentsAPI.markNoShow(id);
      await fetchData();
      setIsDetailModalOpen(false);
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to mark as no-show");
      setError(errorInfo.message);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;
    try {
      await appointmentsAPI.addStaffNotes(selectedAppointment.id, staffNotes);
      await fetchData();
      setError(null);
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to save notes");
      setError(errorInfo.message);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.customerFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.customerLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.customerPhone?.includes(searchTerm);
    const matchesStatus =
      selectedStatus === "all" || apt.status === selectedStatus;
    const matchesVenue =
      selectedVenue === "all" || apt.venueId === selectedVenue;
    const matchesDate =
      !selectedDate || apt.appointmentDate === selectedDate;
    return matchesSearch && matchesStatus && matchesVenue && matchesDate;
  });

  // Sort by date descending (newest first), then by time
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateCompare = new Date(b.appointmentDate) - new Date(a.appointmentDate);
    if (dateCompare !== 0) return dateCompare;
    return (a.appointmentTime || "").localeCompare(b.appointmentTime || "");
  });

  if (loading) {
    return (
      <div className="admin-empty-state">
        <div>Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="admin-card" style={{ padding: "1.5rem" }}>
      {error && (
        <div className="admin-error-state" style={{ marginBottom: "1.5rem" }}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: "1rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          {
            label: "Total",
            count: appointments.length,
            color: "#6366f1",
          },
          {
            label: "Pending",
            count: appointments.filter((a) => a.status === "PENDING").length,
            color: "#f59e0b",
          },
          {
            label: "Confirmed",
            count: appointments.filter((a) => a.status === "CONFIRMED").length,
            color: "#3b82f6",
          },
          {
            label: "Completed",
            count: appointments.filter((a) => a.status === "COMPLETED").length,
            color: "#10b981",
          },
          {
            label: "Cancelled",
            count: appointments.filter((a) => a.status === "CANCELLED").length,
            color: "#ef4444",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "1rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: stat.color,
              }}
            >
              {stat.count}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-input"
          style={{ flex: 1, minWidth: "200px" }}
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="admin-select"
          style={{ width: "150px" }}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          className="admin-select"
          style={{ width: "180px" }}
        >
          <option value="all">All Venues</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="admin-input"
          style={{ width: "160px" }}
        />
        {(searchTerm || selectedStatus !== "all" || selectedVenue !== "all" || selectedDate) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedStatus("all");
              setSelectedVenue("all");
              setSelectedDate("");
            }}
            className="admin-button admin-button-secondary"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Appointments Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.875rem",
          }}
        >
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                Date & Time
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                Customer
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                Contact
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                Venue
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                Service
              </th>
              <th style={{ padding: "0.75rem", textAlign: "center", fontWeight: "600", color: "#475569" }}>
                Status
              </th>
              <th style={{ padding: "0.75rem", textAlign: "center", fontWeight: "600", color: "#475569" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAppointments.map((apt) => {
              const statusStyle = getStatusColor(apt.status);
              return (
                <tr
                  key={apt.id}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    cursor: "pointer",
                  }}
                  onClick={() => handleViewDetails(apt)}
                >
                  <td style={{ padding: "0.75rem" }}>
                    <div style={{ fontWeight: "500", color: "#0f172a" }}>
                      {formatDate(apt.appointmentDate)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {formatTime(apt.appointmentTime)}
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <div style={{ fontWeight: "500", color: "#0f172a" }}>
                      {apt.customerTitle && `${apt.customerTitle} `}
                      {apt.customerFirstName} {apt.customerLastName}
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <div style={{ fontSize: "0.8125rem", color: "#0f172a" }}>
                      {apt.customerEmail || "—"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {apt.customerPhone || "—"}
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem", color: "#475569" }}>
                    {getVenueName(apt.venueId)}
                  </td>
                  <td style={{ padding: "0.75rem", color: "#475569" }}>
                    {apt.service || "General Inquiry"}
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                      }}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td
                    style={{ padding: "0.75rem", textAlign: "center" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      {apt.status === "PENDING" && (
                        <button
                          onClick={() => handleConfirm(apt.id)}
                          className="admin-button admin-button-primary"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                        >
                          Confirm
                        </button>
                      )}
                      {apt.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleComplete(apt.id)}
                          className="admin-button admin-button-primary"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                        >
                          Complete
                        </button>
                      )}
                      {(apt.status === "PENDING" || apt.status === "CONFIRMED") && (
                        <button
                          onClick={() => handleOpenCancelModal(apt)}
                          className="admin-button admin-button-danger"
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedAppointments.length === 0 && (
        <div className="admin-empty-state">
          No appointments found.{" "}
          {(searchTerm || selectedStatus !== "all" || selectedVenue !== "all" || selectedDate) &&
            "Try adjusting your filters."}
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedAppointment && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="admin-modal"
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.5rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#0f172a",
                    }}
                  >
                    Appointment Details
                  </h2>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    ID: {selectedAppointment.id}
                  </div>
                </div>
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    backgroundColor: getStatusColor(selectedAppointment.status).bg,
                    color: getStatusColor(selectedAppointment.status).text,
                    border: `1px solid ${getStatusColor(selectedAppointment.status).border}`,
                  }}
                >
                  {selectedAppointment.status}
                </span>
              </div>

              {/* Customer Info */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Customer Information
                </h3>
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "1rem",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>
                      {selectedAppointment.customerTitle &&
                        `${selectedAppointment.customerTitle} `}
                      {selectedAppointment.customerFirstName}{" "}
                      {selectedAppointment.customerLastName}
                    </strong>
                  </div>
                  {selectedAppointment.customerEmail && (
                    <div style={{ fontSize: "0.875rem", color: "#475569" }}>
                      Email: {selectedAppointment.customerEmail}
                    </div>
                  )}
                  {selectedAppointment.customerPhone && (
                    <div style={{ fontSize: "0.875rem", color: "#475569" }}>
                      Phone: {selectedAppointment.customerPhone}
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Info */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Appointment Details
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "1rem",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Date
                    </div>
                    <div style={{ fontWeight: "500" }}>
                      {formatDate(selectedAppointment.appointmentDate)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "1rem",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Time
                    </div>
                    <div style={{ fontWeight: "500" }}>
                      {formatTime(selectedAppointment.appointmentTime)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "1rem",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Venue
                    </div>
                    <div style={{ fontWeight: "500" }}>
                      {getVenueName(selectedAppointment.venueId)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "1rem",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Service
                    </div>
                    <div style={{ fontWeight: "500" }}>
                      {selectedAppointment.service || "General Inquiry"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedAppointment.notes && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Customer Notes
                  </h3>
                  <div
                    style={{
                      background: "#fefce8",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px solid #fef08a",
                      fontSize: "0.875rem",
                      color: "#713f12",
                    }}
                  >
                    {selectedAppointment.notes}
                  </div>
                </div>
              )}

              {/* Cancellation Reason */}
              {selectedAppointment.status === "CANCELLED" &&
                selectedAppointment.cancellationReason && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h3
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: "600",
                        color: "#475569",
                        marginBottom: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Cancellation Reason
                    </h3>
                    <div
                      style={{
                        background: "#fef2f2",
                        padding: "1rem",
                        borderRadius: "8px",
                        border: "1px solid #fecaca",
                        fontSize: "0.875rem",
                        color: "#991b1b",
                      }}
                    >
                      {selectedAppointment.cancellationReason}
                    </div>
                  </div>
                )}

              {/* Staff Notes */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Staff Notes
                </h3>
                <textarea
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  className="admin-input"
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                  placeholder="Add internal notes about this appointment..."
                />
                <button
                  onClick={handleSaveNotes}
                  className="admin-button admin-button-secondary"
                  style={{ marginTop: "0.5rem" }}
                >
                  Save Notes
                </button>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #e2e8f0",
                  flexWrap: "wrap",
                }}
              >
                {selectedAppointment.status === "PENDING" && (
                  <button
                    onClick={() => handleConfirm(selectedAppointment.id)}
                    className="admin-button admin-button-primary"
                  >
                    Confirm Appointment
                  </button>
                )}
                {selectedAppointment.status === "CONFIRMED" && (
                  <>
                    <button
                      onClick={() => handleComplete(selectedAppointment.id)}
                      className="admin-button admin-button-primary"
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => handleMarkNoShow(selectedAppointment.id)}
                      className="admin-button admin-button-secondary"
                    >
                      Mark as No Show
                    </button>
                  </>
                )}
                {(selectedAppointment.status === "PENDING" ||
                  selectedAppointment.status === "CONFIRMED") && (
                  <button
                    onClick={() => handleOpenCancelModal(selectedAppointment)}
                    className="admin-button admin-button-danger"
                  >
                    Cancel Appointment
                  </button>
                )}
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="admin-button admin-button-outline"
                  style={{ marginLeft: "auto" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {isCancelModalOpen && selectedAppointment && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsCancelModalOpen(false)}
        >
          <div
            className="admin-modal"
            style={{ maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "1.5rem" }}>
              <h2
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#0f172a",
                }}
              >
                Cancel Appointment
              </h2>
              <p style={{ color: "#64748b", marginBottom: "1rem" }}>
                Are you sure you want to cancel the appointment for{" "}
                <strong>
                  {selectedAppointment.customerFirstName}{" "}
                  {selectedAppointment.customerLastName}
                </strong>{" "}
                on {formatDate(selectedAppointment.appointmentDate)} at{" "}
                {formatTime(selectedAppointment.appointmentTime)}?
              </p>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                    fontSize: "0.8125rem",
                    color: "#0f172a",
                  }}
                >
                  Cancellation Reason
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="admin-input"
                  style={{ width: "100%", minHeight: "80px" }}
                  placeholder="Please provide a reason for cancellation..."
                />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  className="admin-button admin-button-secondary"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancel}
                  className="admin-button admin-button-danger"
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsManager;
