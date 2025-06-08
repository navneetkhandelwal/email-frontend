import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedAccessToken && storedRefreshToken) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);

          // Set default authorization header
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;

          // Fetch user data
          const response = await axiosInstance.get('/api/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // If token is invalid, clear everything
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Add axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const response = await axiosInstance.post('/api/auth/refresh-token', {
              refreshToken: refreshToken
            });

            const { accessToken: newAccessToken } = response.data;

            // Update tokens
            setAccessToken(newAccessToken);
            localStorage.setItem('accessToken', newAccessToken);

            // Update authorization header
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            // Retry the original request
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            // If refresh fails, logout
            handleLogout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: userData } = response.data;

      // Store tokens
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Set default authorization header
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', userData);
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: newUser } = response.data;

      // Store tokens
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Set default authorization header
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      if (accessToken) {
        await axiosInstance.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear everything regardless of API call success
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    loading,
    login,
    register,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};