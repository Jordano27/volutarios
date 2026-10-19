import { createContext, useContext, useMemo, useState } from 'react';
import { request } from '../api/http.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('voluntariado_token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('voluntariado_user'));
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('voluntariado_token', result.token);
    localStorage.setItem('voluntariado_user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem('voluntariado_token');
    localStorage.removeItem('voluntariado_user');
    setToken(null);
    setUser(null);
  }

  function updateUser(userData) {
    setUser((currentUser) => {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('voluntariado_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }

  const value = useMemo(() => ({ token, user, login, logout, updateUser }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
