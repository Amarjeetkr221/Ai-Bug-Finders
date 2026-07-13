import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Synchronize token state with axios headers and localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchMe();
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Fetch me failed:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Login failed' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      return res.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const googleLogin = async (profile) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/google-login', { profile });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Google login failed' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const updateCredits = (newCredits) => {
    setUser(prev => prev ? { ...prev, credits: newCredits } : null);
  };

  const refreshUser = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      googleLogin,
      logout,
      updateCredits,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
