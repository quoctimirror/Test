// src/context/AuthContext.js
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig'; // Revert to original api
import requestThrottle from '../utils/requestThrottle';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userCache, setUserCache] = useState({ data: null, timestamp: null });
    const CACHE_DURATION = 300000; // 5 minutes cache (increased from 30s)

    // Persistent storage helpers
    const STORAGE_KEYS = {
        USER_DATA: 'userData',
        USER_CACHE_TIMESTAMP: 'userCacheTimestamp'
    };

    const saveUserToStorage = useCallback((userData) => {
        try {
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
            localStorage.setItem(STORAGE_KEYS.USER_CACHE_TIMESTAMP, Date.now().toString());
        } catch (error) {
            console.warn('Failed to save user data to localStorage:', error);
        }
    }, []);

    const getUserFromStorage = useCallback(() => {
        try {
            const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
            const timestamp = localStorage.getItem(STORAGE_KEYS.USER_CACHE_TIMESTAMP);
            
            if (userData && timestamp) {
                const parsedData = JSON.parse(userData);
                const cacheAge = Date.now() - parseInt(timestamp);
                
                if (cacheAge < CACHE_DURATION) {
                    return parsedData;
                }
            }
        } catch (error) {
            console.warn('Failed to get user data from localStorage:', error);
        }
        return null;
    }, [CACHE_DURATION]);

    const clearUserFromStorage = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            localStorage.removeItem(STORAGE_KEYS.USER_CACHE_TIMESTAMP);
        } catch (error) {
            console.warn('Failed to clear user data from localStorage:', error);
        }
    }, []);

    // Helper functions for caching
    const isCacheValid = useCallback(() => {
        if (!userCache.data || !userCache.timestamp) return false;
        return (Date.now() - userCache.timestamp) < CACHE_DURATION;
    }, [userCache, CACHE_DURATION]);

    const setCachedUser = useCallback((userData) => {
        setUser(userData);
        setUserCache({ 
            data: userData, 
            timestamp: Date.now() 
        });
        saveUserToStorage(userData); // Save to persistent storage
    }, [saveUserToStorage]);

    const fetchUserProfile = useCallback(async () => {
        // Check memory cache first
        if (isCacheValid() && userCache.data) {
            console.log('Using memory cached user data');
            setUser(userCache.data);
            return userCache.data;
        }

        // Check persistent storage cache
        const storedUser = getUserFromStorage();
        if (storedUser) {
            console.log('Using localStorage cached user data');
            setUser(storedUser);
            setUserCache({ data: storedUser, timestamp: Date.now() });
            return storedUser;
        }

        // Only fetch from API if no cache available and not throttled
        const endpoint = '/api/v1/users/me';
        
        if (!requestThrottle.canMakeRequest(endpoint)) {
            const waitTime = requestThrottle.getTimeUntilNext(endpoint);
            console.log(`Request throttled, waiting ${waitTime}ms before next attempt`);
            // Return cached data if available while throttled
            if (storedUser) {
                setUser(storedUser);
                return storedUser;
            }
            throw new Error('Request throttled and no cached data available');
        }

        try {
            console.log('Fetching fresh user data from API');
            const response = await api.get(endpoint);
            setCachedUser(response.data);
            return response.data;
        } catch (error) {
            // If API fails but we have tokens, assume user is authenticated
            const token = localStorage.getItem('accessToken');
            if (token && error.response?.status === 429) {
                console.log('API rate limited, but user has valid token - treating as authenticated');
                // Create minimal user object from token (if possible)
                throw error; // Let caller handle gracefully
            }
            throw error;
        }
    }, [isCacheValid, userCache.data, setCachedUser, getUserFromStorage]);

    const login = async (username, password) => {
        try {
            const response = await api.post('/api/v1/auth/authenticate', { username, password });

            const { accessToken, refreshToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            const userData = await fetchUserProfile();
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        setUserCache({ data: null, timestamp: null }); // Clear memory cache
        clearUserFromStorage(); // Clear persistent cache
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
    }, [clearUserFromStorage]);

    useEffect(() => {
        let isMounted = true;
        
        const verifyUser = async () => {
            const token = localStorage.getItem('accessToken');
            
            if (token) {
                // Try to get user from storage first (immediate response)
                const storedUser = getUserFromStorage();
                if (storedUser && isMounted) {
                    setUser(storedUser);
                    setUserCache({ data: storedUser, timestamp: Date.now() });
                    console.log('Initial user loaded from localStorage');
                }
                
                try {
                    // Then try to fetch fresh data (background refresh)
                    if (isMounted) {
                        await fetchUserProfile();
                    }
                } catch (error) {
                    if (error.response?.status === 429) {
                        console.log("Rate limited - using fallback authentication");
                        // Don't clear tokens on rate limit
                        // If we have stored user data, keep it
                        if (!storedUser && isMounted) {
                            // Create minimal authenticated state
                            console.log("No cached user but have token - treating as authenticated");
                        }
                    } else if (error.response?.status === 401) {
                        // Only clear on actual auth failure
                        console.log("Authentication failed - clearing session");
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        if (isMounted) {
                            setUser(null);
                            setUserCache({ data: null, timestamp: null });
                            clearUserFromStorage();
                        }
                    } else {
                        console.warn("API error during verification:", error.message);
                        // For other errors, keep existing auth state if available
                    }
                }
            } else {
                console.log("No token found - user not authenticated");
            }
            
            if (isMounted) {
                setIsLoading(false);
            }
        };
        
        verifyUser();
        
        return () => {
            isMounted = false;
        };
    }, []); // Remove dependencies to run only once on mount

    const refreshUser = useCallback(async (forceRefresh = false) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                if (forceRefresh) {
                    // Force fresh data by clearing cache
                    setUserCache({ data: null, timestamp: null });
                    clearUserFromStorage();
                }
                return await fetchUserProfile();
            } catch (error) {
                if (error.response?.status === 429) {
                    // On rate limit, try to use cached data
                    const storedUser = getUserFromStorage();
                    if (storedUser) {
                        console.log("Rate limited during refresh - using cached data");
                        setUser(storedUser);
                        return storedUser;
                    }
                    console.warn("Rate limited and no cached data available");
                } else if (error.response?.status === 401) {
                    // Only clear on auth failure
                    console.error("Authentication failed during refresh - clearing session");
                    setUser(null);
                    setUserCache({ data: null, timestamp: null });
                    clearUserFromStorage();
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
                throw error;
            }
        }
    }, [fetchUserProfile, clearUserFromStorage, getUserFromStorage]);

    const value = {
        user,
        setUser,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};