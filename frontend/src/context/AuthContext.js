import React, { createContext, useState, useEffect, useContext } from 'react';
import { userAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await userAPI.login({ email, password });
      const { jwt_token } = response.data;
      localStorage.setItem('token', jwt_token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // Handle network errors
      if (!error.response) {
        return {
          success: false,
          message: 'Network error: Could not connect to server. Make sure the backend is running on port 3000.',
        };
      }
      // Handle API errors
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || 'Login failed',
      };
    }
  };

  const signup = async (username, email, password) => {
    try {
      await userAPI.signup({ username, email, password });
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      // Handle network errors
      if (!error.response) {
        return {
          success: false,
          message: 'Network error: Could not connect to server. Make sure the backend is running on port 3000.',
        };
      }
      // Handle API errors
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data?.error || 'Signup failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
