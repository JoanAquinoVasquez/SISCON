// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type ReactNode } from "react"; // Importamos el tipo ReactNode

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <h1>Cargando...</h1>;

  if (!user) return <Navigate to="/login" />;

  return children;
};