import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { LogOut, User, Menu } from 'lucide-react';

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

export function Header({ toggleMobileSidebar }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h2 className="text-lg font-semibold text-slate-800">Panel de Administración</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'Usuario'}
              className="w-8 h-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          )}
          <div className="text-sm">
            <p className="font-medium text-slate-800">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Cerrar Sesión</span>
        </Button>
      </div>
    </header>
  );
}
