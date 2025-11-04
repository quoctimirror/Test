import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Diamond, DollarSign, Target } from 'lucide-react';

const JewelrySpecificationManager = () => {
  const [specifications, setSpecifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [complexityFilter, setComplexityFilter] = useState('ALL');

  const categories = ['RINGS', 'NECKLACES', 'BRACELETS', 'EARRINGS', 'PENDANTS'];
  const complexities = ['SIMPLE', 'MODERATE', 'COMPLEX', 'MASTERPIECE'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TODO: Implement actual API call
      // const specsResponse = await jewelrySpecAPI.getAll();
      // setSpecifications(specsResponse.data);

      // Mock data for now
      const mockSpecs = [
        {
          id: '1',
          name: 'Classic Diamond Ring',
          category: 'RINGS',
          subcategory: 'Engagement Ring',
          designComplexity: 'MODERATE',
          metalSpec: { metalType: 'GOLD', purityLevel: '18K' },
          stoneSpecs: [{ stoneType: 'DIAMOND', caratWeight: 1.0 }],
          targetAgeGroups: ['25-35', '35-45'],
          estimatedRetailPrice: 15000000,
          targetMargin: 40,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Pearl Necklace Deluxe',
          category: 'NECKLACES',
          subcategory: 'Classic Necklace',
          designComplexity: 'SIMPLE',
          metalSpec: { metalType: 'SILVER', purityLevel: '925' },
          stoneSpecs: [{ stoneType: 'PEARL', caratWeight: 0 }],
          targetAgeGroups: ['35-45', '45+'],
          estimatedRetailPrice: 8500000,
          targetMargin: 35,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Masterpiece Diamond Bracelet',
          category: 'BRACELETS',
          subcategory: 'Tennis Bracelet',
          designComplexity: 'MASTERPIECE',
          metalSpec: { metalType: 'PLATINUM', purityLevel: 'PT950' },
          stoneSpecs: [{ stoneType: 'DIAMOND', caratWeight: 5.0 }],
          targetAgeGroups: ['35-45', '45+'],
          estimatedRetailPrice: 95000000,
          targetMargin: 45,
          createdAt: new Date().toISOString()
        }
      ];
      setSpecifications(mockSpecs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpecs = specifications.filter(spec => {
    const matchesSearch = spec.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spec.subcategory?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || spec.category === categoryFilter;
    const matchesComplexity = complexityFilter === 'ALL' || spec.designComplexity === complexityFilter;

    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this specification?')) {
      return;
    }

    try {
      // TODO: Implement actual API call
      // await jewelrySpecAPI.delete(id);
      setSpecifications(specifications.filter(spec => spec.id !== id));
    } catch (error) {
      console.error('Error deleting specification:', error);
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'SIMPLE': return 'bg-green-100 text-green-800';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLEX': return 'bg-orange-100 text-orange-800';
      case 'MASTERPIECE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="jewelry-specification-manager">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Action Bar */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => alert('Create modal - Coming soon!')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Create New Specification
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search specifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Complexities</option>
              {complexities.map(complexity => (
                <option key={complexity} value={complexity}>{complexity}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>{filteredSpecs.length} specifications</span>
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        {filteredSpecs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Diamond className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No specifications found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || categoryFilter !== 'ALL' || complexityFilter !== 'ALL'
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating your first jewelry specification.'}
            </p>
            <button
              onClick={() => alert('Create modal - Coming soon!')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Specification
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpecs.map((spec) => (
              <div key={spec.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Diamond className="h-4 w-4 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{spec.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert('Edit modal - Coming soon!')}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(spec.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium">{spec.category?.replace('_', ' ') || 'Not specified'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Subcategory:</span>
                      <span className="text-sm font-medium">{spec.subcategory || 'Not specified'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Complexity:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplexityColor(spec.designComplexity)}`}>
                        {spec.designComplexity}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Metal:</span>
                      <span className="text-sm font-medium">
                        {spec.metalSpec ? `${spec.metalSpec.metalType} ${spec.metalSpec.purityLevel?.replace('_', ' ') || ''}` : 'Not specified'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Stones:</span>
                      <span className="text-sm font-medium">
                        {spec.stoneSpecs ? `${spec.stoneSpecs.length} type${spec.stoneSpecs.length !== 1 ? 's' : ''}` : '0 types'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Target Age Groups:</span>
                      <span className="text-sm font-medium">{spec.targetAgeGroups?.length || 0}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Est. Retail Price:</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(spec.estimatedRetailPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Target Margin:</span>
                        <span className="text-sm font-medium text-blue-600">
                          {spec.targetMargin}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Target className="h-3 w-3" />
                        <span>Created: {new Date(spec.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JewelrySpecificationManager;
