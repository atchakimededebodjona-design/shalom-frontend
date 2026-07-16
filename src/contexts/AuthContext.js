'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { setTokens, clearTokens } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data.profile);
        } catch (error) {
          clearTokens();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    setTokens(res.data.tokens); // access_token + refresh_token

    // Fetch profile
    const profileRes = await authService.getMe();
    setUser(profileRes.data.profile);
    router.push('/dashboard');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    setTokens(res.data.tokens);

    // Fetch profile
    const profileRes = await authService.getMe();
    setUser(profileRes.data.profile);
    router.push('/dashboard');
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    router.push('/login');
  };

  // Re-synchronise le profil courant (ex: après une édition de profil)
  const refreshUser = async () => {
    const res = await authService.getMe();
    setUser(res.data.profile);
    return res.data.profile;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
