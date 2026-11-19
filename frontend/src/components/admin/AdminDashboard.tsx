import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  ArrowUpRight, 
  PackagePlus, 
  FileSpreadsheet, 
  Users,
  CheckCircle2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { sales, products, lowStockProducts, setCurrentView } = useApp();

  const completedSales = sales.filter((s) => s.status === 'completada');

  // Financial calculations
  const totalGrossRevenue = completedSales.reduce((acc, s) => acc + s.total, 0);

  // Estimate total cost of goods sold (COGS)
  const totalCostOfGoods = completedSales.reduce((acc, s) => {
    return (
      acc +
      s.items.reduce((sum, item) => {
        const prod = products.find((p) => p.id === item.product.id) || item.product;
        return sum + prod.costPrice * item.quantity;
      }, 0)
    );
  }, 0);

  const estimatedGrossProfit = Math.max(0, totalGrossRevenue - totalCostOfGoods);
  const profitMarginPercent = totalGrossRevenue > 0 ? ((estimatedGrossProfit / totalGrossRevenue) * 100).toFixed(1) : '0';

  // Category breakdown
  const categoryStats = products.reduce((acc: Record<string, number>, prod) => {
    acc[prod.category] = (acc[prod.category] || 0) + prod.stock;
    return acc;
  }, {});

  // Weekly sales mock points for clean SVG chart
  const weeklyTrend = [
    { day: 'Lun', amount: 180 },
    { day: 'Mar', amount: 320 },
    { day: 'Mié', amount: 240 },
    { day: 'Jue', amount: 410 },
    { day: 'Vie', amount: 560 },
    { day: 'Sáb', amount: 620 },
    { day: 'Dom', amount: totalGrossRevenue > 0 ? Math.round(totalGrossRevenue) : 310 },
  ];
  const maxWeeklyAmount = Math.max(...weeklyTrend.map((w) => w.amount), 700);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Panel de Supervisión Administrativa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas consolidadas de ventas, inventario y rotación de papelería
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentView('inventory')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <PackagePlus className="w-4 h-4 text-blue-400" />
            <span>Gestionar Catálogo</span>
          </button>
          <button
            onClick={() => setCurrentView('reports')}
            className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Cierre de Caja</span>
          </button>
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ingresos Totales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ingresos Totales
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            S/. {totalGrossRevenue.toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Facturación acumulada</span>
          </p>
        </div>

        {/* Card 2: Ganancia Bruta Estimada */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ganancia Bruta
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            S/. {estimatedGrossProfit.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Margen comercial: <span className="font-bold text-slate-800">{profitMarginPercent}%</span>
          </p>
        </div>

        {/* Card 3: Productos en Catálogo */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Catálogo
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {products.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ítems registrados en almacén
          </p>
        </div>

        {/* Card 4: Alertas de Stock Bajo */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Alertas de Stock
            </span>
            <div className={`p-2 rounded-lg ${lowStockProducts.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${lowStockProducts.length > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {lowStockProducts.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {lowStockProducts.length > 0 ? 'Ítems en o bajo stock mínimo' : 'Inventario equilibrado'}
          </p>
        </div>
      </div>

      {/* Main Grid: Weekly Sales Chart & Low Stock Action Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Bar Chart (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Rendimiento de Ventas Semanal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Volumen de facturación diaria en mostrador (S/.)
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Semana Actual
            </span>
          </div>

          {/* SVG Bar Chart with Tabular Numerals */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {weeklyTrend.map((item) => {
              const heightPercent = Math.min(100, Math.max(12, Math.round((item.amount / maxWeeklyAmount) * 100)));
              const isToday = item.day === 'Dom' || item.day === 'Jue';
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-mono font-medium text-slate-400 group-hover:text-slate-700 transition-colors">
                    S/ {item.amount}
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden p-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isToday ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Día pico estimado: Sábado</span>
            <span>Ticket medio por cliente: S/. 34.50</span>
          </div>
        </div>

        {/* Stock Breakdown by Category */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
            Distribución de Inventario
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Unidades físicas en tienda por categoría
          </p>

          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, count]) => {
              const totalUnits = Object.values(categoryStats).reduce((a, b) => a + b, 0);
              const percent = totalUnits > 0 ? Math.round((count / totalUnits) * 100) : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[160px]">
                      {category}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px] tabular-nums">
                      {count} uds ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Low Stock Items Requiring Restock */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Productos con Stock Crítico (Reposición Urgente)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Artículos que se encuentran en o por debajo de su umbral mínimo de seguridad
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('inventory')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Abrir Inventario Completo →
          </button>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Todos los productos tienen stock saludable</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Stock Actual</th>
                  <th className="py-2.5 px-3">Stock Mínimo</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-600">
                      {p.sku}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {p.category}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-700">
                      {p.stock} {p.unit}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {p.minStock} {p.unit}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        {p.stock === 0 ? 'Agotado' : 'Bajo Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setCurrentView('inventory')}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      >
                        Ajustar / Reponer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
