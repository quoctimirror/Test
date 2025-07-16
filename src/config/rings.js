// Configuration for ring models
export const ringModels = {
  nhanVang: {
    id: 'nhanVang',
    name: 'Nhẫn Vàng',
    description: 'Nhẫn vàng cao cấp',
    modelPath: '/arTryOn/nhanVang.glb',
    scale: { x: 15, y: 15, z: 15 },
    color: '#FFD700',
    material: 'gold',
    category: 'wedding'
  },
  nhanXam: {
    id: 'nhanXam',
    name: 'Nhẫn Xám',
    description: 'Nhẫn xám hiện đại',
    modelPath: '/arTryOn/nhanXam.glb',
    scale: { x: 15, y: 15, z: 15 },
    color: '#808080',
    material: 'platinum',
    category: 'casual'
  }
};

// Helper function to get ring by ID
export const getRingById = (id) => {
  return ringModels[id] || null;
};

// Helper function to get all ring IDs
export const getAllRingIds = () => {
  return Object.keys(ringModels);
};

// Helper function to validate ring ID
export const isValidRingId = (id) => {
  return id && ringModels.hasOwnProperty(id);
};

// Default ring ID for fallback
export const DEFAULT_RING_ID = 'nhanVang';

export default ringModels;