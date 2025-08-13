# API Usage Guide

Hiện tại có 2 axios instances để phân biệt local và remote backend:

## 1. Local Backend API (api) - Default Export
Dùng cho product management, categories, components, etc.
Auto-detect port 8080, 8081, 3000, 5000

```javascript
import api from "../../api/axiosConfig";

// Sử dụng cho product management
const categories = await api.get("/api/categories");
const components = await api.get("/api/components");
```

## 2. Remote Backend API (remoteApi) - Named Export  
Dùng cho authentication, login, deployed backend

```javascript
import { remoteApi } from "../../api/axiosConfig";

// Sử dụng cho login/auth
const loginResponse = await remoteApi.post("/api/v1/auth/authenticate", {
  username,
  password
});
```

## Environment Variables

### .env.development
```bash
# Remote API (deployed backend)
VITE_REMOTE_API_BASE_URL=https://your-deployed-backend.com

# Local API (auto-detect ports 8080, 8081, 3000, 5000)
# No configuration needed - auto-detection enabled
```

### .env.production
```bash
# Remote API (deployed backend) 
VITE_REMOTE_API_BASE_URL=https://production-backend.com

# Local API - may use ngrok or specific URL
VITE_BACKEND_NGROK_URL=https://your-ngrok-url.ngrok-free.app
```

## Migration Guide

### For Login/Auth Components:
```javascript
// OLD
import api from "../../api/axiosConfig";

// NEW  
import { remoteApi } from "../../api/axiosConfig";

// Replace api with remoteApi for auth calls
const response = await remoteApi.post("/api/v1/auth/authenticate", data);
```

### For Product Management Components:
```javascript
// Keep as is
import api from "../../api/axiosConfig";
const response = await api.get("/api/categories");
```