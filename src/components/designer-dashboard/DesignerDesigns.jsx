import { useState, useEffect } from "react";
import { designersAPI } from "@/services/api";

const DesignerDesigns = ({ designerInfo }) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDesigns = async () => {
      if (!designerInfo?.id) return;

      try {
        setLoading(true);
        const response = await designersAPI.getCurrentDesignerDesigns();

        // Add mock design data consistent with dashboard
        const mockDesigns = [
          {
            id: 'DPR000001',
            designName: 'Eternal Elegance Ring',
            designDescription: 'A timeless solitaire design featuring a brilliant cut diamond set in 18k white gold with delicate prong setting.',
            designConcept: 'Classic elegance meets modern sophistication',
            designInspiration: 'Inspired by eternal love and timeless beauty',
            designStatus: 'ACTIVE',
            featuredDesign: true,
            commissionPercentage: 15.00,
            loyaltyPercentage: 5.00,
            totalSalesCount: 10,
            totalSalesAmount: 45000000,
            totalCommissionEarned: 6750000,
            totalLoyaltyEarned: 2250000,
            averageRating: 4.9,
            reviewCount: 15,
            designCreatedDate: '2024-08-15T10:30:00',
            productConversionDate: '2024-08-20T14:45:00',
            product: {
              id: 'PRD001',
              name: 'Diamond Solitaire Ring',
              sku: 'DSR-18K-001'
            }
          },
          {
            id: 'DPR000002',
            designName: 'Royal Crown Necklace',
            designDescription: 'An opulent necklace featuring multiple diamonds arranged in a crown-like pattern with 24k gold accents.',
            designConcept: 'Regal magnificence for special occasions',
            designInspiration: 'Victorian royal jewelry collections',
            designStatus: 'ACTIVE',
            featuredDesign: false,
            commissionPercentage: 15.00,
            loyaltyPercentage: 5.00,
            totalSalesCount: 8,
            totalSalesAmount: 35000000,
            totalCommissionEarned: 5250000,
            totalLoyaltyEarned: 1750000,
            averageRating: 4.7,
            reviewCount: 8,
            designCreatedDate: '2024-07-20T09:15:00',
            productConversionDate: '2024-07-25T16:20:00',
            product: {
              id: 'PRD002',
              name: 'Gold Diamond Necklace',
              sku: 'GDN-24K-002'
            }
          },
          {
            id: 'DPR000003',
            designName: 'Vintage Rose Bracelet',
            designDescription: 'A delicate bracelet featuring rose-cut diamonds set in vintage-inspired rose gold with intricate filigree work.',
            designConcept: 'Vintage romance with modern craftsmanship',
            designInspiration: 'Art Deco period jewelry and rose gardens',
            designStatus: 'ACTIVE',
            featuredDesign: false,
            commissionPercentage: 15.00,
            loyaltyPercentage: 5.00,
            totalSalesCount: 6,
            totalSalesAmount: 30000000,
            totalCommissionEarned: 4500000,
            totalLoyaltyEarned: 1500000,
            averageRating: 4.8,
            reviewCount: 10,
            designCreatedDate: '2024-06-10T11:45:00',
            productConversionDate: '2024-06-15T13:30:00',
            product: {
              id: 'PRD003',
              name: 'Rose Gold Diamond Bracelet',
              sku: 'RDB-18K-003'
            }
          },
          {
            id: 'DPR000004',
            designName: 'Classic Pearl Earrings',
            designDescription: 'Elegant drop earrings featuring lustrous Tahitian pearls with diamond accents in white gold setting.',
            designConcept: 'Timeless elegance with oceanic beauty',
            designInspiration: 'Natural pearl formations and ocean waves',
            designStatus: 'ACTIVE',
            featuredDesign: false,
            commissionPercentage: 15.00,
            loyaltyPercentage: 5.00,
            totalSalesCount: 4,
            totalSalesAmount: 15000000,
            totalCommissionEarned: 2250000,
            totalLoyaltyEarned: 750000,
            averageRating: 4.6,
            reviewCount: 7,
            designCreatedDate: '2024-09-05T15:20:00',
            productConversionDate: '2024-09-10T10:15:00',
            product: {
              id: 'PRD004',
              name: 'Tahitian Pearl Earrings',
              sku: 'TPE-WG-004'
            }
          },
          {
            id: 'DPR000005',
            designName: 'Modern Geometric Pendant',
            designDescription: 'A contemporary pendant featuring geometric diamond arrangements in a minimalist platinum setting.',
            designConcept: 'Modern minimalism meets geometric precision',
            designInspiration: 'Contemporary architecture and geometric art',
            designStatus: 'DRAFT',
            featuredDesign: false,
            commissionPercentage: 15.00,
            loyaltyPercentage: 5.00,
            totalSalesCount: 0,
            totalSalesAmount: 0,
            totalCommissionEarned: 0,
            totalLoyaltyEarned: 0,
            averageRating: null,
            reviewCount: 0,
            designCreatedDate: '2024-09-25T08:30:00',
            productConversionDate: null,
            product: null
          }
        ];

        setDesigns(mockDesigns);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch designs');
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, [designerInfo]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="designer-designs-loading">
        <div className="loading-spinner"></div>
        <p>Loading designs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="designer-designs-error">
        <h3>Error Loading Designs</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="designer-designs-empty">
        <div className="empty-state">
          <div className="empty-icon">D</div>
          <h3>No Designs Found</h3>
          <p>You haven't created any designs yet.</p>
          <p>Contact the administrator to set up your first design.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="designer-designs">
      <div className="designs-header">
        <h2>My Designs ({designs.length})</h2>
        <p>Manage and track the performance of your designs</p>
      </div>

      <div className="designs-grid">
        {designs.map(design => (
          <div key={design.id} className="design-card">
            <div className="design-header">
              <h3>{design.designName || `Design ${design.id}`}</h3>
              <span className={`status-badge ${design.designStatus?.toLowerCase()}`}>
                {design.designStatus || 'Active'}
              </span>
            </div>

            <div className="design-description">
              {design.designDescription && (
                <p>{design.designDescription}</p>
              )}
            </div>

            <div className="design-details">
              <div className="detail-row">
                <span className="label">Product:</span>
                <span className="value">{design.productName || design.productId}</span>
              </div>

              {design.designConcept && (
                <div className="detail-row">
                  <span className="label">Concept:</span>
                  <span className="value">{design.designConcept}</span>
                </div>
              )}

              {design.designInspiration && (
                <div className="detail-row">
                  <span className="label">Inspiration:</span>
                  <span className="value">{design.designInspiration}</span>
                </div>
              )}

              <div className="detail-row">
                <span className="label">Created:</span>
                <span className="value">{formatDate(design.designCreatedDate)}</span>
              </div>

              {design.productConversionDate && (
                <div className="detail-row">
                  <span className="label">Product Launch:</span>
                  <span className="value">{formatDate(design.productConversionDate)}</span>
                </div>
              )}
            </div>

            <div className="design-commission">
              <h4>Commission Structure</h4>
              <div className="commission-details">
                <div className="commission-item">
                  <span className="label">Commission:</span>
                  <span className="value">{design.commissionPercentage || 0}%</span>
                </div>
                <div className="commission-item">
                  <span className="label">Loyalty:</span>
                  <span className="value">{design.loyaltyPercentage || 0}%</span>
                </div>
                <div className="commission-item total">
                  <span className="label">Total:</span>
                  <span className="value">{(design.commissionPercentage || 0) + (design.loyaltyPercentage || 0)}%</span>
                </div>
              </div>
            </div>

            <div className="design-performance">
              <h4>Performance</h4>
              <div className="performance-grid">
                <div className="performance-item">
                  <div className="performance-value">{design.totalSalesCount || 0}</div>
                  <div className="performance-label">Sales</div>
                </div>
                <div className="performance-item">
                  <div className="performance-value">{formatCurrency(design.totalSalesAmount || 0)}</div>
                  <div className="performance-label">Revenue</div>
                </div>
                <div className="performance-item">
                  <div className="performance-value">{formatCurrency((design.totalCommissionEarned || 0) + (design.totalLoyaltyEarned || 0))}</div>
                  <div className="performance-label">Earnings</div>
                </div>
                <div className="performance-item">
                  <div className="performance-value">
                    {design.averageRating ? `${parseFloat(design.averageRating).toFixed(1)}/5` : 'N/A'}
                  </div>
                  <div className="performance-label">Rating</div>
                </div>
              </div>
            </div>

            {design.featuredDesign && (
              <div className="featured-badge">
                Featured Design
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignerDesigns;