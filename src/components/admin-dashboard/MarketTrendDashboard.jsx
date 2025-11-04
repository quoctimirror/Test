import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, Target, Globe, BarChart3, RefreshCw } from 'lucide-react';

const MarketTrendDashboard = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const categories = ['ALL', 'RINGS', 'NECKLACES', 'BRACELETS', 'EARRINGS'];
  const seasons = ['SPRING', 'SUMMER', 'FALL', 'WINTER'];

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

  const getTrendIcon = (priceImpact) => {
    if (priceImpact > 0) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (priceImpact < 0) return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <BarChart3 className="h-5 w-5 text-gray-600" />;
  };

  const getStrengthColor = (strength) => {
    if (strength >= 0.8) return 'bg-green-100 text-green-800';
    if (strength >= 0.6) return 'bg-yellow-100 text-yellow-800';
    if (strength >= 0.4) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="market-trend-dashboard">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Action Bar */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={fetchMarketData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={20} />
            Refresh Data
          </button>
        </div>
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="ml-auto text-sm text-gray-600">
              {filteredTrends.length} trends found
            </div>
          </div>
        </div>

        {/* Trends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrends.map((trend) => (
            <div key={trend.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getTrendIcon(trend.priceImpact)}
                  <h3 className="text-lg font-semibold text-gray-900">{trend.trendName}</h3>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{trend.description}</p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium">{trend.category}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Trend Strength:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStrengthColor(trend.strength)}`}>
                    {formatPercentage(trend.strength)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price Impact:</span>
                  <span className={`text-sm font-medium ${trend.priceImpact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.priceImpact > 0 ? '+' : ''}{formatPercentage(trend.priceImpact)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Peak Season:</span>
                  <span className="text-sm font-medium">{trend.peakSeason}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Est. Duration:</span>
                  <span className="text-sm font-medium">{trend.estimatedDuration} days</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTrends.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trends found</h3>
            <p className="text-sm text-gray-500">
              Try selecting a different category or refresh the data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketTrendDashboard;
