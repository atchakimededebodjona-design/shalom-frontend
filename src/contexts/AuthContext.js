'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Les tokens vivent dans des cookies httpOnly : impossible (et inutile)
    // de vérifier leur présence en JS. On demande directement le profil ;
    // un 401 signifie simplement "non connecté".
    const initAuth = async () => {
      try {
        const res = await authService.getMe();
        setUser(res.data.profile);
      } catch (error) {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    // Le backend pose les cookies httpOnly access_token/refresh_token —
    // rien à stocker côté client.
    await authService.login(email, password);

    // Fetch profile
    const profileRes = await authService.getMe();
    setUser(profileRes.data.profile);
    router.push('/dashboard');
  };

  const register = async (userData) => {
    // L'inscription n'émet plus de session : un code de vérification est
    // envoyé par email, il faut le confirmer via verifyEmail() avant de
    // pouvoir se connecter.
    const res = await authService.register(userData);
    router.push(`/verify-email?email=${encodeURIComponent(userData.email)}`);
    return res;
  };

  const verifyEmail = async (email, code) => {
    await authService.verifyEmail({ email, code });

    // Le backend a posé les cookies httpOnly : connexion automatique.
    const profileRes = await authService.getMe();
    setUser(profileRes.data.profile);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  // Re-synchronise le profil courant (ex: après une édition de profil)
  const refreshUser = async () => {
    const res = await authService.getMe();
    setUser(res.data.profile);
    return res.data.profile;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyEmail, logout, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
