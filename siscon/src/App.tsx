// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import UsersPage from './pages/Users';
import ProgramasPage from './pages/Programas';
import { DocentesPage } from './pages/Docentes';
import { CoordinadoresPage } from './pages/Coordinadores';
import PagosDocentesList from './pages/PagosDocentes/PagosDocentesList';
import PagoDocenteForm from './pages/PagosDocentes/PagoDocenteForm';
import ExpedientesList from './pages/Expedientes/ExpedientesList';
import ExpedienteForm from './pages/Expedientes/ExpedienteForm';
import { MainLayout } from './components/layout/MainLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import { AuthCallback } from './pages/AuthCallback';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

        <Route path="/" element={user ? <MainLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="programas" element={<ProgramasPage />} />
          <Route path="docentes" element={<DocentesPage />} />
          <Route path="coordinadores" element={<CoordinadoresPage />} />
          <Route path="pagos-docentes" element={
            <ErrorBoundary>
              <PagosDocentesList />
            </ErrorBoundary>
          } />
          <Route path="pagos-docentes/nuevo" element={
            <ErrorBoundary>
              <PagoDocenteForm />
            </ErrorBoundary>
          } />
          <Route path="pagos-docentes/:id/editar" element={
            <ErrorBoundary>
              <PagoDocenteForm />
            </ErrorBoundary>
          } />
          <Route path="expedientes" element={
            <ErrorBoundary>
              <ExpedientesList />
            </ErrorBoundary>
          } />
          <Route path="expedientes/nuevo" element={
            <ErrorBoundary>
              <ExpedienteForm />
            </ErrorBoundary>
          } />
          <Route path="expedientes/:id/editar" element={
            <ErrorBoundary>
              <ExpedienteForm />
            </ErrorBoundary>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;