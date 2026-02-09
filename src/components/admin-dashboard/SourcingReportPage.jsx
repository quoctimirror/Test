import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Send,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  User,
  Mail,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react";
import api from "../../services/api";
import "./SourcingReportPage.css";

const SourcingReportPage = () => {
  const [productionPlans, setProductionPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [sendingReport, setSendingReport] = useState(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch production plans on mount
  useEffect(() => {
    fetchProductionPlans();
  }, []);

  // Fetch reports when plan is selected
  useEffect(() => {
    if (selectedPlan) {
      fetchReportsForPlan(selectedPlan.id);
    } else {
      setReports([]);
    }
  }, [selectedPlan]);

  const fetchProductionPlans = async () => {
    setPlansLoading(true);
    try {
      const response = await api.get("/api/v1/production-plans", {
        params: { size: 100, sortBy: "createdAt", sortDir: "desc" },
      });
      const data = response.data;
      // Filter to only show plans that are at least in PLANNING status
      const eligiblePlans = (data.content || []).filter(
        (plan) => plan.status !== "DRAFT"
      );
      setProductionPlans(eligiblePlans);
    } catch (err) {
      setError("Failed to load production plans: " + (err.response?.data?.message || err.message));
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchReportsForPlan = async (planId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/v1/sourcing-reports/by-plan/${planId}`);
      setReports(response.data);
    } catch (err) {
      setError("Failed to load sourcing reports: " + (err.response?.data?.message || err.message));
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (planId, vendorId, vendorCode) => {
    setDownloadingPdf(vendorId);
    try {
      const response = await api.get(
        `/api/v1/sourcing-reports/by-plan/${planId}/vendor/${vendorId}/pdf`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sourcing-report-${vendorCode}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to download PDF: " + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleSendReport = async (planId, vendorId, vendorName) => {
    if (!window.confirm(`Send sourcing report to ${vendorName}?`)) return;

    setSendingReport(vendorId);
    try {
      const response = await api.post(
        `/api/v1/sourcing-reports/by-plan/${planId}/vendor/${vendorId}/send`
      );
      setSuccessMessage(`Report sent to ${response.data.vendorEmail}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError("Failed to send report: " + (err.response?.data?.message || err.message));
    } finally {
      setSendingReport(null);
    }
  };

  const handleSendAllReports = async () => {
    if (!selectedPlan) return;
    if (
      !window.confirm(
        `Send sourcing reports to all ${reports.length} vendors?`
      )
    )
      return;

    setSendingAll(true);
    try {
      const response = await api.post(
        `/api/v1/sourcing-reports/by-plan/${selectedPlan.id}/send-all`
      );
      const result = response.data;
      setSuccessMessage(
        `Sent ${result.successCount} of ${result.totalVendors} reports successfully`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError("Failed to send reports: " + (err.response?.data?.message || err.message));
    } finally {
      setSendingAll(false);
    }
  };

  const toggleReportExpand = (vendorId) => {
    setExpandedReport(expandedReport === vendorId ? null : vendorId);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { color: "gray", icon: Clock },
      PLANNING: { color: "blue", icon: Clock },
      APPROVED: { color: "green", icon: CheckCircle },
      IN_PRODUCTION: { color: "orange", icon: Package },
      COMPLETED: { color: "purple", icon: CheckCircle },
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;
    return (
      <span className={`status-badge status-${config.color}`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  return (
    <div className="sourcing-report-page">
      <div className="page-header">
        <div className="header-content">
          <FileText size={28} />
          <div>
            <h1>Sourcing Reports</h1>
            <p>Generate and send sourcing requests to production partners</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-banner">
          <CheckCircle size={18} />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Plan Selector */}
      <div className="plan-selector-section">
        <label>Select Production Plan</label>
        {plansLoading ? (
          <div className="loading-inline">
            <Loader2 className="spin" size={18} />
            Loading plans...
          </div>
        ) : (
          <div className="plan-selector-row">
            <select
              value={selectedPlan?.id || ""}
              onChange={(e) => {
                const plan = productionPlans.find((p) => p.id === e.target.value);
                setSelectedPlan(plan || null);
              }}
            >
              <option value="">-- Select a production plan --</option>
              {productionPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.status})
                </option>
              ))}
            </select>
            <button
              className="btn-refresh"
              onClick={fetchProductionPlans}
              disabled={plansLoading}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Selected Plan Info */}
      {selectedPlan && (
        <div className="plan-info-card">
          <div className="plan-info-header">
            <h3>{selectedPlan.name}</h3>
            {getStatusBadge(selectedPlan.status)}
          </div>
          <div className="plan-info-details">
            <div className="info-item">
              <span className="label">Target Start:</span>
              <span className="value">{formatDate(selectedPlan.targetStartDate)}</span>
            </div>
            <div className="info-item">
              <span className="label">Target End:</span>
              <span className="value">{formatDate(selectedPlan.targetEndDate)}</span>
            </div>
            {selectedPlan.workflowTemplateName && (
              <div className="info-item">
                <span className="label">Workflow:</span>
                <span className="value">{selectedPlan.workflowTemplateName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports Section */}
      {selectedPlan && (
        <div className="reports-section">
          <div className="reports-header">
            <h2>
              Vendor Sourcing Reports
              {reports.length > 0 && (
                <span className="report-count">({reports.length} vendors)</span>
              )}
            </h2>
            {reports.length > 0 && (
              <button
                className="btn-send-all"
                onClick={handleSendAllReports}
                disabled={sendingAll}
              >
                {sendingAll ? (
                  <>
                    <Loader2 className="spin" size={16} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send All Reports
                  </>
                )}
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader2 className="spin" size={32} />
              <p>Generating sourcing reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>No Sourcing Reports</h3>
              <p>
                No vendors have been assigned to production orders in this plan.
                <br />
                Assign vendors to stages first, then return here to generate
                reports.
              </p>
            </div>
          ) : (
            <div className="reports-list">
              {reports.map((report) => (
                <div key={report.vendorId} className="report-card">
                  <div
                    className="report-card-header"
                    onClick={() => toggleReportExpand(report.vendorId)}
                  >
                    <div className="vendor-info">
                      <User size={20} />
                      <div>
                        <h4>{report.vendorName}</h4>
                        <span className="vendor-code">{report.vendorCode}</span>
                      </div>
                    </div>
                    <div className="report-summary">
                      <div className="summary-item">
                        <span className="label">Orders</span>
                        <span className="value">{report.totalOrders}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Qty</span>
                        <span className="value">{report.totalQuantity}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Est. Cost</span>
                        <span className="value cost">
                          {formatCurrency(report.estimatedTotalCost)}
                        </span>
                      </div>
                    </div>
                    <div className="report-actions">
                      <button
                        className="btn-icon"
                        title="Download PDF"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPdf(
                            selectedPlan.id,
                            report.vendorId,
                            report.vendorCode
                          );
                        }}
                        disabled={downloadingPdf === report.vendorId}
                      >
                        {downloadingPdf === report.vendorId ? (
                          <Loader2 className="spin" size={16} />
                        ) : (
                          <Download size={16} />
                        )}
                      </button>
                      <button
                        className="btn-icon btn-send"
                        title="Send to Vendor"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendReport(
                            selectedPlan.id,
                            report.vendorId,
                            report.vendorName
                          );
                        }}
                        disabled={sendingReport === report.vendorId || !report.vendorEmail}
                      >
                        {sendingReport === report.vendorId ? (
                          <Loader2 className="spin" size={16} />
                        ) : (
                          <Send size={16} />
                        )}
                      </button>
                      {expandedReport === report.vendorId ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>

                  {expandedReport === report.vendorId && (
                    <div className="report-card-details">
                      {/* Vendor Contact */}
                      <div className="detail-section">
                        <h5>Contact Information</h5>
                        <div className="contact-info">
                          {report.vendorEmail && (
                            <div className="contact-item">
                              <Mail size={14} />
                              {report.vendorEmail}
                            </div>
                          )}
                          {report.vendorPhone && (
                            <div className="contact-item">
                              <span>📞</span>
                              {report.vendorPhone}
                            </div>
                          )}
                          {report.vendorCountry && (
                            <div className="contact-item">
                              <span>🌍</span>
                              {report.vendorCountry}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Material Summary */}
                      {report.materialSummary && (
                        <div className="detail-section">
                          <h5>Material Summary</h5>
                          {report.materialSummary.metals?.length > 0 && (
                            <div className="material-group">
                              <h6>Metals</h6>
                              <table className="material-table">
                                <thead>
                                  <tr>
                                    <th>Type</th>
                                    <th>Purity</th>
                                    <th>Total Weight</th>
                                    <th>Orders</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {report.materialSummary.metals.map((metal, idx) => (
                                    <tr key={idx}>
                                      <td>{metal.metalType}</td>
                                      <td>{metal.purity}</td>
                                      <td>{metal.totalWeight?.toFixed(2)}g</td>
                                      <td>{metal.orderCount}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {report.materialSummary.stones?.length > 0 && (
                            <div className="material-group">
                              <h6>Stones</h6>
                              <table className="material-table">
                                <thead>
                                  <tr>
                                    <th>Type</th>
                                    <th>Shape</th>
                                    <th>Qty</th>
                                    <th>Total Carat</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {report.materialSummary.stones.map((stone, idx) => (
                                    <tr key={idx}>
                                      <td>{stone.stoneType}</td>
                                      <td>{stone.shape}</td>
                                      <td>{stone.totalQuantity}</td>
                                      <td>{stone.totalCaratWeight?.toFixed(2)} ct</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          <div className="cost-summary">
                            <div className="cost-item">
                              <span>Metal Cost:</span>
                              <span>{formatCurrency(report.materialSummary.totalMetalCost)}</span>
                            </div>
                            <div className="cost-item">
                              <span>Stone Cost:</span>
                              <span>{formatCurrency(report.materialSummary.totalStoneCost)}</span>
                            </div>
                            <div className="cost-item">
                              <span>Labor Cost:</span>
                              <span>{formatCurrency(report.materialSummary.totalLaborCost)}</span>
                            </div>
                            <div className="cost-item total">
                              <span>Grand Total:</span>
                              <span>{formatCurrency(report.materialSummary.grandTotal)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Orders List */}
                      <div className="detail-section">
                        <h5>Assigned Orders ({report.orders?.length || 0})</h5>
                        <div className="orders-list">
                          {report.orders?.map((order) => (
                            <div key={order.orderId} className="order-item">
                              <div className="order-header">
                                <span className="order-number">{order.orderNumber}</span>
                                <span className="order-stage">
                                  Stage: {order.stageName} (#{order.stageOrder})
                                </span>
                              </div>
                              <div className="order-details">
                                {order.reportNumber && (
                                  <span>JTRC: {order.reportNumber}</span>
                                )}
                                {order.category && <span>{order.category}</span>}
                                <span>Qty: {order.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Plan Selected State */}
      {!selectedPlan && !plansLoading && (
        <div className="no-plan-state">
          <FileText size={48} />
          <h3>Select a Production Plan</h3>
          <p>
            Choose a production plan from the dropdown above to view and manage
            sourcing reports for assigned vendors.
          </p>
        </div>
      )}
    </div>
  );
};

export default SourcingReportPage;
