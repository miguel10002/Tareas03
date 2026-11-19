import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../../../shared/types';
import { Printer, CheckCircle, X, Download, RotateCcw } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
  onNewSale?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose, onNewSale }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const getDocTitle = () => {
    switch (sale.receiptType) {
      case 'factura':
        return 'FACTURA ELECTRÓNICA';
      case 'ticket':
        return 'TICKET DE VENTA';
      default:
        return 'BOLETA DE VENTA ELECTRÓNICA';
    }
  };

  const formattedDate = new Date(sale.timestamp).toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Venta Registrada Exitosamente
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voucher Sheet / Thermal Paper Simulation */}
        <div className="p-6 bg-slate-50 font-mono text-xs text-slate-800 space-y-4 select-text">
          {/* Store Info */}
          <div className="text-center space-y-0.5 pb-3 border-b border-dashed border-slate-300 font-sans">
            <div className="text-base font-extrabold text-slate-900 tracking-tight">
              ÚTILES EXPRESS S.A.C.
            </div>
            <div className="text-[11px] text-slate-600">RUC: 20608912341</div>
            <div className="text-[11px] text-slate-500">
              Av. Principal 1420 - San Borja, Lima
            </div>
            <div className="text-[11px] text-slate-500">Telf: (01) 456-7890</div>
          </div>

          {/* Document Header */}
          <div className="text-center py-1">
            <div className="font-bold text-slate-900 text-sm tracking-wide">
              {getDocTitle()}
            </div>
            <div className="font-bold text-blue-700 text-xs mt-0.5">
              N° {sale.receiptNumber}
            </div>
          </div>

          {/* Metadata */}
          <div className="text-[11px] space-y-1 py-2 border-y border-dashed border-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha y Hora:</span>
              <span className="font-medium text-slate-800">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cajero:</span>
              <span className="font-medium text-slate-800">{sale.sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">
                {sale.customer.documentType}:
              </span>
              <span className="font-medium text-slate-800">
                {sale.customer.documentNumber || '00000000'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cliente:</span>
              <span className="font-medium text-slate-800 truncate max-w-[200px]">
                {sale.customer.name || 'Cliente Mostrador'}
              </span>
            </div>
            {sale.customer.address && (
              <div className="flex justify-between">
                <span className="text-slate-500">Dirección:</span>
                <span className="font-medium text-slate-800 truncate max-w-[200px]">
                  {sale.customer.address}
                </span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between font-bold text-slate-500 text-[10px] uppercase border-b border-slate-200 pb-1">
              <span>Cant. / Descripción</span>
              <span className="text-right">Total (S/.)</span>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {sale.items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-start text-[11px]">
                  <div className="pr-2">
                    <div className="font-medium text-slate-800">{item.product.name}</div>
                    <div className="text-slate-400 text-[10px]">
                      {item.quantity} x S/. {item.unitPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900 tabular-nums shrink-0 pt-0.5">
                    {item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Op. Gravada:</span>
              <span className="tabular-nums">S/. {sale.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>I.G.V. (18%):</span>
              <span className="tabular-nums">S/. {sale.tax.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Descuento aplicado:</span>
                <span className="tabular-nums">- S/. {sale.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL A PAGAR:</span>
              <span className="tabular-nums font-mono">S/. {sale.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span className="capitalize">Método: {sale.paymentMethod.replace('_', ' / ')}</span>
              <span className="tabular-nums">S/. {sale.amountPaid.toFixed(2)}</span>
            </div>
            {sale.paymentMethod === 'efectivo' && (
              <div className="flex justify-between text-slate-800 font-semibold">
                <span>Vuelto:</span>
                <span className="tabular-nums text-emerald-700">S/. {sale.changeGiven.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Footer message and simulated SUNAT hash */}
          <div className="pt-3 text-center space-y-1 text-[10px] text-slate-500 font-sans border-t border-dashed border-slate-300">
            <p className="font-medium text-slate-700">
              ¡Gracias por su compra en Útiles Express!
            </p>
            <p>Representación impresa de comprobante electrónico.</p>
            <p className="font-mono text-[9px] text-slate-400">
              HASH: 8f9b4c2e1a7d6e5c3b2a
            </p>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimir Ticket</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onNewSale && (
              <button
                onClick={() => {
                  onClose();
                  onNewSale();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nueva Venta</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
