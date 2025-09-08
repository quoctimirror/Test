import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Tạo một loader để load file 3D
const loader = new GLTFLoader();

// Một nơi để lưu trữ các model đã load (để không phải load lại)
const savedModels = {};

/**
 * Load một file 3D (.glb) từ thư mục public/models
 * @param {string} fileName - Tên file (không cần .glb)
 * @returns {Promise} - Trả về model đã load
 */
export async function loadModel(fileName) {
  // Kiểm tra xem đã load model này chưa
  if (savedModels[fileName]) {
    console.log(`Model ${fileName} đã có sẵn`);
    return copyModel(savedModels[fileName]);
  }

  console.log(`Đang load model: ${fileName}...`);
  
  try {
    // Load file từ thư mục public/models
    const model = await new Promise((resolve, reject) => {
      loader.load(
        `/models/${fileName}.glb`,  // Đường dẫn file
        resolve,                    // Thành công
        (progress) => {             // Tiến trình load
          const percent = Math.round((progress.loaded / progress.total) * 100);
          console.log(`${fileName}: ${percent}%`);
        },
        reject                      // Lỗi
      );
    });

    // Lưu model để lần sau không phải load lại
    savedModels[fileName] = model;
    
    console.log(`✅ Load thành công: ${fileName}`);
    return model;
    
  } catch (error) {
    console.error(`❌ Lỗi load model ${fileName}:`, error);
    throw error;
  }
}

/**
 * Load nhiều model cùng một lúc
 * @param {Array} fileNames - Danh sách tên file
 * @returns {Promise} - Trả về array các model
 */
export async function loadMultipleModels(fileNames) {
  console.log('Đang load nhiều models:', fileNames);
  
  const promises = fileNames.map(fileName => loadModel(fileName));
  const models = await Promise.all(promises);
  
  console.log('✅ Load xong tất cả models');
  return models;
}

/**
 * Tạo bản copy của model (để dùng nhiều lần)
 * @param {Object} originalModel - Model gốc
 * @returns {Object} - Bản copy của model
 */
function copyModel(originalModel) {
  return {
    scene: originalModel.scene.clone(),
    animations: originalModel.animations ? [...originalModel.animations] : []
  };
}

/**
 * Lấy danh sách tất cả animations của model
 * @param {Object} model - Model đã load
 * @returns {Array} - Danh sách animations
 */
export function getAnimations(model) {
  return model.animations || [];
}

/**
 * Kiểm tra model đã được load chưa
 * @param {string} fileName - Tên file cần kiểm tra
 * @returns {boolean} - true nếu đã load
 */
export function isModelLoaded(fileName) {
  return fileName in savedModels;
}

/**
 * Xem danh sách các model đã load
 * @returns {Array} - Danh sách tên file đã load
 */
export function getLoadedModels() {
  return Object.keys(savedModels);
}

/**
 * Xóa model khỏi bộ nhớ
 * @param {string} fileName - Tên file cần xóa
 */
export function removeModel(fileName) {
  if (savedModels[fileName]) {
    delete savedModels[fileName];
    console.log(`🗑️ Đã xóa model: ${fileName}`);
  }
}

/**
 * Xóa tất cả model khỏi bộ nhớ
 */
export function clearAllModels() {
  const count = Object.keys(savedModels).length;
  for (let fileName in savedModels) {
    delete savedModels[fileName];
  }
  console.log(`🗑️ Đã xóa ${count} models`);
}