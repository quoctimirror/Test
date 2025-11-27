import { loadEnv } from 'vite';

// Load env variables
const mode = process.env.NODE_ENV || 'development';
const env = loadEnv(mode, process.cwd(), '');

const cdnUrl = env.VITE_CLOUDFLARE_MEDIA_URL || '';

// Custom PostCSS plugin to replace __CDN_URL__ placeholder
const replaceCdnUrl = () => {
  return {
    postcssPlugin: 'postcss-cdn-url-replace',
    Once(root) {
      root.walkDecls((decl) => {
        if (decl.value.includes('__CDN_URL__')) {
          decl.value = decl.value.replace(/__CDN_URL__/g, cdnUrl);
        }
      });
    }
  };
};
replaceCdnUrl.postcss = true;

export default {
  plugins: [replaceCdnUrl()]
};
