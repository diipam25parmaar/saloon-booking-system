import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/user');
      setUser(res.data.user);
    } catch (error) {
      console.error("Failed to fetch user", error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('auth_token', res.data.access_token);
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await api.post('/register', { 
      name, 
      email, 
      password, 
      password_confirmation: password 
    });
    localStorage.setItem('auth_token', res.data.access_token);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    return await api.post('/forgot-password', { email });
  };

  const resetPassword = async (data) => {
    return await api.post('/reset-password', data);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
