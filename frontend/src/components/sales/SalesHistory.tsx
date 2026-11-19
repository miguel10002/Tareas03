import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Filter, 
  Eye, 
  RotateCcw, 
  FileText, 
  CheckCircle, 
  XCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Calendar,
  Download
} from 'lucide-react';
import { ReceiptModal } from '../pos/ReceiptModal';
import { Sale } from '../../../../shared/types';

export const SalesHistory: React.FC = () => {
  const { sales, cancelSale, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = 
        !q ||
        sale.receiptNumber.toLowerCase().includes(q) ||
        sale.customer.name.toLowerCase().includes(q) ||
        sale.customer.documentNumber.includes(q) ||
        sale.sellerName.toLowerCase().includes(q);

      const matchesType = filterType === 'all' || sale.receiptType === filterType;
      const matchesPayment = filterPayment === 'all' || sale.paymentMethod === filterPayment;

      return matchesQuery && matchesType && matchesPayment;
    });
  }, [sales, searchQuery, filterType, filterPayment]);

  const handleCancelSale = (sale: Sale) => {
    if (sale.status === 'anulada') return;
    if (window.confirm(`¿Está seguro de anular la venta ${sale.receiptNumber}? Se reincorporará el stock a los productos correspondientes.`)) {
      cancelSale(sale.id);
    }
  };

  const paymentBadge = (method: string) => {
    switch (method) {
      case 'efectivo':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700">
            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            <span>Efectivo</span>
          </span>
        );
      case 'tarjeta':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Tarjeta</span>
          </span>
        );
      case 'yape_plin':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700">
            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
            <span>Yape/Plin</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-slate-700">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Transf.</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Historial de Operaciones
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro completo de boletas, facturas y notas de venta
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Total registros: <span className="font-bold text-slate-900">{filteredSales.length}</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por comprobante, DNI, RUC o cliente..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">Todos los comprobantes</option>
              <option value="boleta">Boletas de Venta</option>
              <option value="factura">Facturas Electrónicas</option>
              <option value="ticket">Tickets de Mostrador</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">Todos los métodos de pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta (POS)</option>
              <option value="yape_plin">Yape / Plin</option>
              <option value="transferencia">Transferencia Bancaria</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No se encontraron ventas</p>
            <p className="text-[11px] text-slate-400 mt-1">Pruebe ajustando los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Comprobante</th>
                  <th className="py-3 px-4">Cliente / Razón Social</th>
                  <th className="py-3 px-4">Vendedor</th>
                  <th className="py-3 px-4">Método de Pago</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((sale) => {
                  const isCancelled = sale.status === 'anulada';
                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCancelled ? 'bg-red-50/20 text-slate-400' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(sale.timestamp).toLocaleString('es-PE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {sale.receiptNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-[180px]">
                          {sale.customer.name || 'Cliente Mostrador'}
                        </div>
                        {sale.customer.documentNumber && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {sale.customer.documentType}: {sale.customer.documentNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {sale.sellerName}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {paymentBadge(sale.paymentMethod)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isCancelled ? (
                          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Anulada
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Completada
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
                        S/. {sale.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Ver Comprobante"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {currentUser?.role === 'admin' && !isCancelled && (
                            <button
                              onClick={() => handleCancelSale(sale)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Anular venta y reponer stock"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Voucher detail modal */}
      <ReceiptModal
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </div>
  );
};
