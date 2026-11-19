import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  History, 
  Package, 
  BarChart3, 
  Users, 
  LogOut, 
  ShoppingBag,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentUser, currentView, setCurrentView, logout, resetToDemoData } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const sellerNav = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'pos', label: 'Registrar Venta', icon: ShoppingCart },
    { id: 'sales_history', label: 'Historial de Ventas', icon: History },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Panel General', icon: LayoutDashboard },
    { id: 'pos', label: 'Registrar Venta', icon: ShoppingCart },
    { id: 'inventory', label: 'Gestión Inventario', icon: Package },
    { id: 'reports', label: 'Reportes y Cierre', icon: BarChart3 },
    { id: 'sales_history', label: 'Historial de Ventas', icon: History },
    { id: 'users', label: 'Personal y Usuarios', icon: Users },
  ];

  const navItems = isAdmin ? adminNav : sellerNav;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Lockup */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-white tracking-tight leading-none text-base">
            Útiles Express
          </div>
          <div className="text-[11px] text-blue-400 font-medium mt-0.5">
            {isAdmin ? 'Módulo Administrativo' : 'Módulo de Mostrador'}
          </div>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="px-4 py-3 mx-4 my-3 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Sesión Activa
          </div>
          <div className="text-xs font-semibold text-white truncate">
            {currentUser?.name}
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
          isAdmin ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50' : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
        }`}>
          {isAdmin ? 'Admin' : 'Ventas'}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navegación
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom utility & actions */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {/* Reset to initial demo data button */}
        <button
          onClick={() => {
            if (window.confirm('¿Desea restaurar los datos de prueba de productos y ventas?')) {
              resetToDemoData();
            }
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Restaura catálogo y ventas iniciales"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar datos demo</span>
        </button>

        {/* Log out */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
