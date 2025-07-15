// Configuration loader
import defaultConfig from './default.js';
import developmentConfig from './development.js';
import productionConfig from './production.js';

// Get environment from Vite's import.meta.env or default to 'default'
const env = import.meta.env?.MODE || 'default';

const configs = {
  default: defaultConfig,
  development: developmentConfig,
  production: productionConfig
};

// Deep merge function to combine configurations
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

// Load configuration based on environment
const config = env === 'default' ? defaultConfig : deepMerge(defaultConfig, configs[env] || {});

export default config;