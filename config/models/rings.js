// Configuration for ring models
export const ringModels = {
  nhanVang: {
    id: "nhanVang",
    name: "Gold Ring",
    description: "Premium gold ring",
    modelPath: "/arTryOn/nhanVang.glb",
    scale: { x: 15, y: 15, z: 15 },
    color: "#FFD700",
    material: "gold",
    category: "wedding",
  },
  nhanXam: {
    id: "nhanXam",
    name: "Silver Ring",
    description: "Modern silver ring",
    modelPath: "/arTryOn/nhanXam.glb",
    scale: { x: 15, y: 15, z: 15 },
    color: "#808080",
    material: "platinum",
    category: "casual",
  },
  nhanBase: {
    id: "nhanBase",
    name: "Silver Ring",
    description: "Modern silver ring",
    modelPath: "/arTryOn/nhanBase.glb",
    scale: { x: 15, y: 15, z: 15 },
    color: "#808080",
    material: "platinum",
    category: "casual",
  },
  nhanDario: {
    id: "nhanDario",
    name: "",
    description: "",
    modelPath: "/arTryOn/nhanDario.glb",
  },
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
  return id && Object.prototype.hasOwnProperty.call(ringModels, id);
};

// Default ring ID for fallback
export const DEFAULT_RING_ID = "nhanDario";

export default ringModels;
