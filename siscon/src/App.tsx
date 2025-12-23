// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import UsersPage from './pages/Users';
import ProgramasPage from './pages/Programas';
import { DocentesPage } from './pages/Docentes';
import { CoordinadoresPage } from './pages/Coordinadores';
import PagosDocentesList from './pages/PagosDocentes/PagosDocentesList';
import PagoDocenteForm from './pages/PagosDocentes/PagoDocenteForm';
import { MainLayout } from './components/layout/MainLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;