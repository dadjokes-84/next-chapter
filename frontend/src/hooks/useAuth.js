<<<<<<< HEAD
import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(false);

  const signup = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('authToken', data.token);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('authToken', data.token);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  }, []);

  const getCurrentUser = useCallback(async () => {
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch user');

      const data = await response.json();
      setUser(data.user);
      return data.user;
    } catch (error) {
      logout();
      return null;
    }
  }, [token]);

  return {
    user,
    token,
    loading,
    signup,
    login,
    logout,
    getCurrentUser,
    isAuthenticated: !!token,
  };
}
=======
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
>>>>>>> b3ec451c97525c80f8638f94cc7a45f71f659054
