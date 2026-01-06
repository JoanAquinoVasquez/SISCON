// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo-epg.webp';
import {
  Users,
  UserCog,
  ClipboardList,
  FileText,
  MapPin,
  DollarSign,
  Stethoscope,
  FolderOpen,
  Home
} from 'lucide-react';
import { cn } from '../../lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: FolderOpen, label: 'Expedientes', path: '/expedientes' },
  { icon: DollarSign, label: 'Pagos Docentes', path: '/pagos-docentes' },
  // Programas, Grados, Semestres, Cursos removed as they are default and not editable
  { icon: ClipboardList, label: 'Coordinadores', path: '/coordinadores' },
  // { icon: FileText, label: 'Asignación Docencia', path: '/asignaciones-docencia' },
  // { icon: Stethoscope, label: 'Asignación Enfermería', path: '/asignaciones-enfermeria' },
  // { icon: DollarSign, label: 'Pagos Coordinador', path: '/pagos-coordinadores' },
  { icon: Users, label: 'Usuarios', path: '/users' },
  { icon: UserCog, label: 'Docentes', path: '/docentes' },
  // { icon: MapPin, label: 'Lugares Procedencia', path: '/lugares-procedencia' },
  { icon: FileText, label: 'Oficios', path: '/oficios' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 h-screen sticky top-0 shadow-lg">
      <div className="p-6 border-b border-slate-200 bg-white/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md">
            <img src={logo} alt="logo" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">SISCON</h1>
            <p className="text-xs text-slate-600">Sistema de Contabilidad EPG</p>
          </div>
        </div>
      </div>

      <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100vh-100px)]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-700 hover:bg-white hover:shadow-sm hover:text-blue-600"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-500")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
