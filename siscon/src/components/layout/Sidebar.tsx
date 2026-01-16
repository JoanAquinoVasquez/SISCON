import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo-epg.webp';
import {
  Users,
  UserCog,
  ClipboardList,
  FileText,
  DollarSign,
  FolderOpen,
  Home,
  X,
  FileCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: FolderOpen, label: 'Expedientes', path: '/expedientes' },
  { icon: DollarSign, label: 'Pagos Docentes', path: '/pagos-docentes' },
  { icon: ClipboardList, label: 'Coordinadores', path: '/coordinadores' },
  { icon: Users, label: 'Usuarios', path: '/users' },
  { icon: UserCog, label: 'Docentes', path: '/docentes' },
  { icon: FileText, label: 'Oficios', path: '/documentos/oficios' },
  { icon: FileCheck, label: 'Resoluciones', path: '/documentos/resoluciones' },
  { icon: DollarSign, label: 'Devoluciones', path: '/devoluciones' },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 h-screen fixed md:sticky top-0 shadow-lg transition-all duration-300 z-50 flex flex-col overflow-x-hidden",
          isCollapsed ? "w-20" : "w-64",
          // Mobile responsive classes
          "md:translate-x-0", // Always visible on desktop (width controlled by isCollapsed)
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0" // Hidden on mobile unless open
        )}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        {/* Header */}
        <div className={cn(
          "border-b border-slate-200 bg-white/50 flex items-center shrink-0 h-20",
          isCollapsed ? "justify-center" : "px-6 justify-between"
        )}>
          <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
            <div className="w-10 h-14 min-w-[2.5rem] flex items-center justify-center">
              <img src={logo} alt="logo" className="w-full h-full object-cover" />
            </div>
            <div className="whitespace-nowrap">
              <h1 className="text-xl font-bold gradient-text">SISCON</h1>
              <p className="text-xs text-slate-600">Sistema de Contabilidad</p>
            </div>
          </div>

          {/* Collapsed Logo (Only visible when collapsed) */}
          <div className={cn("absolute transition-all duration-300", isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none")}>
            <div className="w-10 h-14">
              <img src={logo} alt="logo" className="w-full h-full" />
            </div>
          </div>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-700 hover:bg-white hover:shadow-sm hover:text-blue-600",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 min-w-[1.25rem]", isActive ? "text-white" : "text-slate-500")} />
                {!isCollapsed && <span>{item.label}</span>}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
