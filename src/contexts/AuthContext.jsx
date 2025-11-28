'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentUser,
  isAuthenticated,
  refreshToken
} from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación al cargar
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      } else {
        // Intentar refresh
        try {
          await refreshToken();
          const currentUser = getCurrentUser();
          setUser(currentUser);
        } catch {
          setUser(null);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const result = await loginService(credentials);
    const currentUser = getCurrentUser();
    setUser(currentUser);
    return result;
  };

  const register = async (data) => {
    const result = await registerService(data);
    const currentUser = getCurrentUser();
    setUser(currentUser);
    return result;
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
