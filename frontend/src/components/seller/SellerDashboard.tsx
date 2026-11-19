import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Receipt, 
  PackageCheck, 
  Clock, 
  PlusCircle, 
  Search, 
  FileText, 
  Eye, 
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';
import { Sale } from '../../../../shared/types';

export const SellerDashboard: React.FC = () => {
  const { sales, currentUser, setCurrentView, setViewingReceipt } = useApp();

  // Filter sales made today by this seller (or all today sales in demo)
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(
    (s) => s.timestamp.startsWith(todayStr) && s.status === 'completada'
  );

  const totalSalesCount = todaySales.length;
  const totalAmountSold = todaySales.reduce((acc, s) => acc + s.total, 0);
  const totalUnitsDispatched = todaySales.reduce(
    (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );
  const lastSale: Sale | undefined = todaySales[0];

  const paymentIcon = (method: string) => {
    switch (method) {
      case 'efectivo':
        return <Banknote className="w-3.5 h-3.5 text-emerald-600" />;
      case 'tarjeta':
        return <CreditCard className="w-3.5 h-3.5 text-blue-600" />;
      case 'yape_plin':
        return <Smartphone className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Receipt className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const paymentLabel = (method: string) => {
    switch (method) {
      case 'efectivo': return 'Efectivo';
      case 'tarjeta': return 'Tarjeta';
      case 'yape_plin': return 'Yape / Plin';
      case 'transferencia': return 'Transferencia';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Hola, {currentUser?.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Resumen operativo del turno · Tienda Mostrador Principal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('pos')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Nueva Venta (POS)</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (4 required metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Número de ventas del día */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ventas del Día
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalSalesCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Comprobantes emitidos hoy
          </p>
        </div>

        {/* Metric 2: Importe total vendido */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Facturado
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            S/. {totalAmountSold.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ingresos brutos del turno
          </p>
        </div>

        {/* Metric 3: Productos vendidos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unidades Vendidas
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalUnitsDispatched}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Artículos despachados
          </p>
        </div>

        {/* Metric 4: Última venta registrada */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Última Venta
            </span>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          {lastSale ? (
            <div>
              <div className="text-base font-bold font-mono text-slate-900">
                S/. {lastSale.total.toFixed(2)}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="font-semibold text-blue-700">{lastSale.receiptNumber}</span>
                <span>·</span>
                <span>
                  {new Date(lastSale.timestamp).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-1">
              Sin operaciones registradas hoy
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Últimas ventas del día and Quick Catalog Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table: Últimas Ventas de Hoy (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Ventas Registradas Hoy
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Últimos comprobantes emitidos en el sistema
              </p>
            </div>
            <button
              onClick={() => setCurrentView('sales_history')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Ver historial completo →
            </button>
          </div>

          {todaySales.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">Aún no hay ventas hoy</p>
              <p className="text-xs text-slate-400 mt-1">
                Presione el botón "Registrar Nueva Venta" para abrir el terminal POS.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-3">Comprobante</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">Pago</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-center">Ticket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todaySales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(sale.timestamp).toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                        {sale.receiptNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]">
                        {sale.customer.name || 'Cliente Mostrador'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          {paymentIcon(sale.paymentMethod)}
                          <span className="text-[11px]">{paymentLabel(sale.paymentMethod)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
                        S/. {sale.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setViewingReceipt(sale)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Ver detalle del ticket"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Operations & Fast Actions (Spans 1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Acceso Rápido POS
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentView('pos')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-slate-900 group-hover:text-blue-700">
                    Terminal de Venta
                  </div>
                  <span className="text-blue-600 text-xs font-bold">→</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Cobro con código de barras o búsqueda rápida
                </div>
              </button>

              <button
                onClick={() => setCurrentView('sales_history')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-slate-900">
                    Consultar Ventas Pasadas
                  </div>
                  <span className="text-slate-400 text-xs font-bold">→</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Búsqueda por DNI, RUC o número de boleta
                </div>
              </button>
            </div>
          </div>

          {/* Quick Stationery Tips */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
              Guía Operativa del Vendedor
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Recuerda solicitar el RUC del cliente antes de iniciar la venta si requiere
              Factura Electrónica. Todos los precios de mostrador incluyen el 18% de IGV.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Caja Central: 01</span>
              <span>Modo: Producción</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
