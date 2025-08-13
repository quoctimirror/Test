// Simple request throttling utility
class RequestThrottle {
    constructor() {
        this.requestTimes = new Map();
        this.minInterval = 1000; // Minimum 1 second between identical requests
    }

    // Check if we can make a request to this endpoint
    canMakeRequest(endpoint) {
        const now = Date.now();
        const lastRequest = this.requestTimes.get(endpoint);
        
        if (!lastRequest || (now - lastRequest) >= this.minInterval) {
            this.requestTimes.set(endpoint, now);
            return true;
        }
        
        return false;
    }

    // Get time until next request is allowed
    getTimeUntilNext(endpoint) {
        const now = Date.now();
        const lastRequest = this.requestTimes.get(endpoint);
        
        if (!lastRequest) return 0;
        
        const elapsed = now - lastRequest;
        return Math.max(0, this.minInterval - elapsed);
    }

    // Clear throttle for an endpoint (useful for forced refreshes)
    clearThrottle(endpoint) {
        this.requestTimes.delete(endpoint);
    }

    // Clear all throttles
    clearAll() {
        this.requestTimes.clear();
    }
}

export default new RequestThrottle();