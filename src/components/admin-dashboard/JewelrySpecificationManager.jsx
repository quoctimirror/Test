import React, { useState, useEffect } from 'react';

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

  const getComplexityStyle = (complexity) => {
    switch (complexity) {
      case 'SIMPLE': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'MODERATE': return { backgroundColor: '#fef3c7', color: '#854d0e' };
      case 'COMPLEX': return { backgroundColor: '#fed7aa', color: '#9a3412' };
      case 'MASTERPIECE': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { backgroundColor: '#f1f5f9', color: '#475569' };
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
      <div className="admin-empty-state">
        Loading specifications...
      </div>
    );
  }

  return (
    <div>
      {/* Action Bar */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
          Jewelry Specifications
        </h1>
        <button
          onClick={() => alert('Create modal - Coming soon!')}
          className="admin-button admin-button-primary"
        >
          + Create New Specification
        </button>
      </div>

      {/* Filters and Search */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <input
              type="text"
              placeholder="Search specifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
              style={{ width: '100%' }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category.replace('_', ' ')}</option>
            ))}
          </select>

          <select
            value={complexityFilter}
            onChange={(e) => setComplexityFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">All Complexities</option>
            {complexities.map(complexity => (
              <option key={complexity} value={complexity}>{complexity}</option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
            {filteredSpecs.length} specifications
          </div>
        </div>
      </div>

      {/* Specifications Grid */}
      {filteredSpecs.length === 0 ? (
        <div className="admin-empty-state">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>No specifications found</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
            {searchTerm || categoryFilter !== 'ALL' || complexityFilter !== 'ALL'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating your first jewelry specification.'}
          </p>
          <button
            onClick={() => alert('Create modal - Coming soon!')}
            className="admin-button admin-button-primary"
          >
            + Create Specification
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredSpecs.map((spec) => (
            <div key={spec.id} className="admin-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>{spec.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => alert('Edit modal - Coming soon!')}
                    className="admin-button admin-button-outline"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(spec.id)}
                    className="admin-button admin-button-danger"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Category:</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>{spec.category?.replace('_', ' ') || 'Not specified'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Subcategory:</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>{spec.subcategory || 'Not specified'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Complexity:</span>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    borderRadius: '12px',
                    ...getComplexityStyle(spec.designComplexity)
                  }}>
                    {spec.designComplexity}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Metal:</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                    {spec.metalSpec ? `${spec.metalSpec.metalType} ${spec.metalSpec.purityLevel?.replace('_', ' ') || ''}` : 'Not specified'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Stones:</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                    {spec.stoneSpecs ? `${spec.stoneSpecs.length} type${spec.stoneSpecs.length !== 1 ? 's' : ''}` : '0 types'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Target Age Groups:</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>{spec.targetAgeGroups?.length || 0}</span>
                </div>

                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Est. Retail Price:</span>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: '#10b981' }}>
                      {formatCurrency(spec.estimatedRetailPrice)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Target Margin:</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0f172a' }}>
                      {spec.targetMargin}%
                    </span>
                  </div>
                </div>

                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Created: {new Date(spec.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JewelrySpecificationManager;
