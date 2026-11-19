import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { PosRegister } from './components/pos/PosRegister';
import { SalesHistory } from './components/sales/SalesHistory';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { InventoryManagement } from './components/admin/InventoryManagement';
import { ReportsManagement } from './components/admin/ReportsManagement';
import { UsersManagement } from './components/admin/UsersManagement';
import { ShieldAlert } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isReady, currentUser, currentView, setCurrentView } = useApp();

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Conectando con el sistema...</div>;
  }

  // If not logged in, show authentication screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  const isAdmin = currentUser.role === 'admin';

  // Role restriction guard
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return isAdmin ? <AdminDashboard /> : <SellerDashboard />;
      case 'pos':
        return <PosRegister />;
      case 'sales_history':
        return <SalesHistory />;
      case 'inventory':
        if (!isAdmin) {
          return (
            <div className="p-8 bg-white rounded-xl border border-rose-200 text-center max-w-lg mx-auto mt-12 space-y-3">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Acceso Restringido</h3>
              <p className="text-xs text-slate-500">
                El módulo de gestión de inventario y catálogo es exclusivo para usuarios con rol de Administrador.
              </p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                Volver a mi panel de ventas
              </button>
            </div>
          );
        }
        return <InventoryManagement />;
      case 'reports':
        if (!isAdmin) {
          return (
            <div className="p-8 bg-white rounded-xl border border-rose-200 text-center max-w-lg mx-auto mt-12 space-y-3">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Acceso Restringido</h3>
              <p className="text-xs text-slate-500">
                El módulo de reportes y arqueo de caja es de acceso reservado para la administración de la tienda.
              </p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                Volver a mi panel de ventas
              </button>
            </div>
          );
        }
        return <ReportsManagement />;
      case 'users':
        if (!isAdmin) {
          return (
            <div className="p-8 bg-white rounded-xl border border-rose-200 text-center max-w-lg mx-auto mt-12 space-y-3">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Acceso Restringido</h3>
              <p className="text-xs text-slate-500">
                La administración de cuentas y personal requiere privilegios de Administrador.
              </p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                Volver a mi panel de ventas
              </button>
            </div>
          );
        }
        return <UsersManagement />;
      default:
        return isAdmin ? <AdminDashboard /> : <SellerDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800 antialiased">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
