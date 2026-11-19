import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  Banknote, 
  CreditCard, 
  Smartphone, 
  FileText,
  DollarSign,
  TrendingUp,
  Receipt
} from 'lucide-react';

export const ReportsManagement: React.FC = () => {
  const { sales } = useApp();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (s.status !== 'completada') return false;
      if (period === 'today') {
        return s.timestamp.startsWith(todayStr);
      }
      if (period === 'week') {
        const saleDate = new Date(s.timestamp);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return saleDate >= weekAgo;
      }
      if (period === 'month') {
        const saleDate = new Date(s.timestamp);
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return saleDate >= monthAgo;
      }
      return true;
    });
  }, [sales, period, todayStr]);

  // Aggregated totals
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalTax = filteredSales.reduce((acc, s) => acc + s.tax, 0);
  const totalSubtotal = filteredSales.reduce((acc, s) => acc + s.subtotal, 0);

  // Method breakdown
  const cashTotal = filteredSales
    .filter((s) => s.paymentMethod === 'efectivo')
    .reduce((acc, s) => acc + s.total, 0);

  const cardTotal = filteredSales
    .filter((s) => s.paymentMethod === 'tarjeta')
    .reduce((acc, s) => acc + s.total, 0);

  const yapeTotal = filteredSales
    .filter((s) => s.paymentMethod === 'yape_plin')
    .reduce((acc, s) => acc + s.total, 0);

  const transferTotal = filteredSales
    .filter((s) => s.paymentMethod === 'transferencia')
    .reduce((acc, s) => acc + s.total, 0);

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = [
      'N° Comprobante',
      'Tipo',
      'Fecha y Hora',
      'Cliente',
      'Documento',
      'Método de Pago',
      'Subtotal (S/.)',
      'IGV 18% (S/.)',
      'Total (S/.)',
      'Vendedor',
    ];

    const rows = filteredSales.map((s) => [
      `"${s.receiptNumber}"`,
      `"${s.receiptType.toUpperCase()}"`,
      `"${new Date(s.timestamp).toLocaleString('es-PE')}"`,
      `"${s.customer.name.replace(/"/g, '""')}"`,
      `"${s.customer.documentNumber}"`,
      `"${s.paymentMethod}"`,
      s.subtotal.toFixed(2),
      s.tax.toFixed(2),
      s.total.toFixed(2),
      `"${s.sellerName.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ventas_${period}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Reportes Comerciales y Cierre de Caja
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Liquidación de cobros en mostrador, desglose tributario y balance contable
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                period === 'today' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                period === 'week' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Días
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                period === 'month' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                period === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Histórico
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Descargar CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Total Facturado (Bruto)
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            S/. {totalRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {filteredSales.length} comprobantes procesados
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Base Imponible (Op. Gravada)
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-700">
            S/. {totalSubtotal.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ventas netas sin impuestos
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            I.G.V. Débito Fiscal (18%)
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-700">
            S/. {totalTax.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Declaración tributaria SUNAT
          </div>
        </div>
      </div>

      {/* Cash Box Breakdown / Cierre de Caja */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
          Desglose de Liquidación por Medio de Pago
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Arqueo para conciliar el dinero físico en gaveta y las transferencias electrónicas
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cash */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-bold uppercase tracking-wider">Efectivo en Gaveta</span>
              <Banknote className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-900 tabular-nums">
              S/. {cashTotal.toFixed(2)}
            </div>
            <p className="text-[11px] text-emerald-700">
              Dinero físico a rendir
            </p>
          </div>

          {/* Cards */}
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-blue-800">
              <span className="text-xs font-bold uppercase tracking-wider">Tarjetas POS</span>
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold font-mono text-blue-900 tabular-nums">
              S/. {cardTotal.toFixed(2)}
            </div>
            <p className="text-[11px] text-blue-700">
              Vouchers Izipay / Niubiz
            </p>
          </div>

          {/* Yape / Plin */}
          <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-purple-800">
              <span className="text-xs font-bold uppercase tracking-wider">Yape / Plin</span>
              <Smartphone className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-bold font-mono text-purple-900 tabular-nums">
              S/. {yapeTotal.toFixed(2)}
            </div>
            <p className="text-[11px] text-purple-700">
              Billeteras digitales
            </p>
          </div>

          {/* Transfer */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider">Transferencias</span>
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              S/. {transferTotal.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-500">
              Abonos en cuenta bancaria
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
