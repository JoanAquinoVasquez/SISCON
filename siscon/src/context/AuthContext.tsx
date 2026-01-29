// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useToast } from "./ToastContext";
import axios from "../lib/axios";
import { LoadingScreen } from "../components/ui/LoadingScreen";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  google_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  signInWithGoogle: () => void;
  loginWithToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchUser = async (token: string) => {
    try {
      // Set default header for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = await axios.get('/auth/me');
      setUser(response.data.user);
    } catch (error: any) {
      console.error("Error fetching user", error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithToken = (token: string) => {
    localStorage.setItem('auth_token', token);
    fetchUser(token);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    showToast('Sesión cerrada', 'success');
  };

  const signInWithGoogle = () => {
    // Redirect to backend auth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/redirect`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithGoogle, loginWithToken }}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};