// src/context/AuthContext.tsx
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import type { User } from "firebase/auth"; 
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth } from "../firebase";
import { useToast } from "./ToastContext";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Validar usuario con backend
  const validateUser = async (firebaseUser: User): Promise<boolean> => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return true;
      }

      if (response.status === 403) {
        const data = await response.json();
        showToast(data.message || 'Email no autorizado', 'error');
      }
      return false;
    } catch (error) {
      showToast('Error de conexión', 'error');
      return false;
    }
  };

  // Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const isValid = await validateUser(currentUser);
        if (isValid) {
          setUser(currentUser);
        } else {
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => {
    signOut(auth);
    showToast('Sesión cerrada', 'success');
  };
  
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged se encargará de validar
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        showToast('Login cancelado', 'warning');
      } else {
        showToast('Error al iniciar sesión', 'error');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};