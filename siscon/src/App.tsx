// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import UsersPage from './pages/Users';
import ProgramasPage from './pages/Programas';

// Placeholder pages - will be implemented
const GradosPage = () => <div>Grados CRUD - En desarrollo</div>;
const SemestresPage = () => <div>Semestres CRUD - En desarrollo</div>;
const CursosPage = () => <div>Cursos CRUD - En desarrollo</div>;
const DocentesPage = () => <div>Docentes CRUD - En desarrollo</div>;
const CoordinadoresPage = () => <div>Coordinadores CRUD - En desarrollo</div>;
const AsignacionesDocenciaPage = () => <div>Asignaciones Docencia CRUD - En desarrollo</div>;
const AsignacionesEnfermeriaPage = () => <div>Asignaciones Enfermería CRUD - En desarrollo</div>;
const PagosCoordinadoresPage = () => <div>Pagos Coordinadores CRUD - En desarrollo</div>;
const LugaresProcedenciaPage = () => <div>Lugares Procedencia CRUD - En desarrollo</div>;
const OficiosPage = () => <div>Oficios CRUD - En desarrollo</div>;

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="programas" element={<ProgramasPage />} />
        <Route path="grados" element={<GradosPage />} />
        <Route path="semestres" element={<SemestresPage />} />
        <Route path="cursos" element={<CursosPage />} />
        <Route path="docentes" element={<DocentesPage />} />
        <Route path="coordinadores" element={<CoordinadoresPage />} />
        <Route path="asignaciones-docencia" element={<AsignacionesDocenciaPage />} />
        <Route path="asignaciones-enfermeria" element={<AsignacionesEnfermeriaPage />} />
        <Route path="pagos-coordinadores" element={<PagosCoordinadoresPage />} />
        <Route path="lugares-procedencia" element={<LugaresProcedenciaPage />} />
        <Route path="oficios" element={<OficiosPage />} />
      </Route>
    </Routes>
  );
}

export default App;