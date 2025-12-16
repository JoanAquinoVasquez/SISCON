// src/context/AuthContext.tsx
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// 2. Importa el TIPO 'User' por separado usando 'import type'
import type { User } from "firebase/auth"; 

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth } from "../firebase";

// Definimos los tipos para TypeScript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  signInWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Este "escucha" mantiene la sesión viva
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto más fácil
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};