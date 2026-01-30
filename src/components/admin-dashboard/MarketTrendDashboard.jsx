import React, { useState, useEffect } from 'react';

const MarketTrendDashboard = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const categories = ['ALL', 'RINGS', 'NECKLACES', 'BRACELETS', 'EARRINGS'];

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API calls
      // const trendsResponse = await marketTrendAPI.getAll();
      // setTrends(trendsResponse.data);

      // Mock data
      const mockTrends = [
        {
          id: '1',
          category: 'RINGS',
          trendName: 'Minimalist Gold Rings',
          description: 'Simple, elegant gold rings gaining popularity',
          strength: 0.85,
          priceImpact: 0.15,
          peakSeason: 'SPRING',
          estimatedDuration: 180
        },
        {
          id: '2',
          category: 'NECKLACES',
          trendName: 'Layered Diamond Necklaces',
          description: 'Multi-layer diamond necklace trend',
          strength: 0.72,
          priceImpact: 0.20,
          peakSeason: 'SUMMER',
          estimatedDuration: 120
        },
        {
          id: '3',
          category: 'BRACELETS',
          trendName: 'Tennis Bracelets Revival',
          description: 'Classic tennis bracelets making comeback',
          strength: 0.65,
          priceImpact: 0.10,
          peakSeason: 'FALL',
          estimatedDuration: 90
        }
      ];
      setTrends(mockTrends);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrends = trends.filter(trend =>
    selectedCategory === 'ALL' || trend.category === selectedCategory
  );

  const getTrendIndicator = (priceImpact) => {
    if (priceImpact > 0) return { symbol: '↑', color: '#10b981' };
    if (priceImpact < 0) return { symbol: '↓', color: '#ef4444' };
    return { symbol: '→', color: '#64748b' };
  };

  const getStrengthStyle = (strength) => {
    if (strength >= 0.8) return { backgroundColor: '#dcfce7', color: '#166534' };
    if (strength >= 0.6) return { backgroundColor: '#fef3c7', color: '#854d0e' };
    if (strength >= 0.4) return { backgroundColor: '#fed7aa', color: '#9a3412' };
    return { backgroundColor: '#fee2e2', color: '#991b1b' };
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        Loading market trends...
      </div>
    );
  }

  return (
    <div>
      {/* Action Bar */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
          Market Trends
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={fetchMarketData}
            className="admin-button admin-button-primary"
          >
            ⟳ Refresh Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label className="admin-label" style={{ margin: 0 }}>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="admin-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
            {filteredTrends.length} trends found
          </div>
        </div>
      </div>

      {/* Trends Grid */}
      {filteredTrends.length === 0 ? (
        <div className="admin-empty-state">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>No trends found</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Try selecting a different category or refresh the data.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredTrends.map((trend) => {
            const indicator = getTrendIndicator(trend.priceImpact);
            return (
              <div key={trend.id} className="admin-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', color: indicator.color }}>{indicator.symbol}</span>
                    <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>{trend.trendName}</h3>
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>{trend.description}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Category:</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>{trend.category}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Trend Strength:</span>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      borderRadius: '12px',
                      ...getStrengthStyle(trend.strength)
                    }}>
                      {formatPercentage(trend.strength)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Price Impact:</span>
                    <span style={{
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      color: trend.priceImpact > 0 ? '#10b981' : '#ef4444'
                    }}>
                      {trend.priceImpact > 0 ? '+' : ''}{formatPercentage(trend.priceImpact)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Peak Season:</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>{trend.peakSeason}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Est. Duration:</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>{trend.estimatedDuration} days</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MarketTrendDashboard;
