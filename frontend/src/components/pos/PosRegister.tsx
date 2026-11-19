import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory, ReceiptType, PaymentMethod, CustomerInfo } from '../../../../shared/types';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Check, 
  AlertCircle, 
  FileText, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  ArrowRight,
  User,
  Building,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

export const PosRegister: React.FC = () => {
  const { 
    products, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    cartTotals,
    completeSale,
    viewingReceipt,
    setViewingReceipt
  } = useApp();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Checkout Form states
  const [receiptType, setReceiptType] = useState<ReceiptType>('boleta');
  const [customerDocType, setCustomerDocType] = useState<'DNI' | 'RUC' | 'Sin documento'>('DNI');
  const [customerDocNumber, setCustomerDocNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [amountPaidStr, setAmountPaidStr] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const categories: ProductCategory[] = [
    'Cuadernos y Blocks',
    'Escritura y Corrección',
    'Papelería y Archivo',
    'Arte y Diseño',
    'Oficina y Adhesivos',
  ];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = 
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.brand.toLowerCase().includes(q) ||
        prod.sku.toLowerCase().includes(q) ||
        prod.barcode.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle receipt type change to auto-set document type
  const handleReceiptTypeChange = (type: ReceiptType) => {
    setReceiptType(type);
    if (type === 'factura') {
      setCustomerDocType('RUC');
    } else if (type === 'boleta' && customerDocType === 'RUC') {
      setCustomerDocType('DNI');
    }
  };

  // Cash payment calculations
  const finalPayable = Math.max(0, Number((cartTotals.total - discount).toFixed(2)));
  const parsedAmountPaid = parseFloat(amountPaidStr) || 0;
  const changeToGive = paymentMethod === 'efectivo' ? Math.max(0, parsedAmountPaid - finalPayable) : 0;

  // Quick cash buttons
  const setExactCash = () => setAmountPaidStr(finalPayable.toFixed(2));
  const setCash = (amt: number) => setAmountPaidStr(amt.toFixed(2));

  // Submit Sale Handler
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (cart.length === 0) {
      setErrorBanner('El ticket de venta está vacío. Agregue productos para continuar.');
      return;
    }

    if (receiptType === 'factura') {
      if (!customerDocNumber.trim() || customerDocNumber.trim().length !== 11) {
        setErrorBanner('Para emitir Factura Electrónica se requiere un número de RUC válido de 11 dígitos.');
        return;
      }
      if (!customerName.trim()) {
        setErrorBanner('Por favor ingrese la Razón Social del cliente para la factura.');
        return;
      }
    }

    if (paymentMethod === 'efectivo') {
      if (parsedAmountPaid < finalPayable) {
        setErrorBanner(`El monto recibido (S/. ${parsedAmountPaid.toFixed(2)}) es menor al total a pagar (S/. ${finalPayable.toFixed(2)}).`);
        return;
      }
    }

    const customer: CustomerInfo = {
      documentType: customerDocType,
      documentNumber: customerDocNumber.trim(),
      name: customerName.trim() || (receiptType === 'factura' ? 'Empresa Cliente' : 'Cliente Mostrador'),
    };

    try {
      completeSale({
        customer,
        receiptType,
        paymentMethod,
        amountPaid: paymentMethod === 'efectivo' ? parsedAmountPaid : finalPayable,
        discount,
      });

      // Reset form states for next customer
      setCustomerDocNumber('');
      setCustomerName('');
      setAmountPaidStr('');
      setDiscount(0);
    } catch (err: any) {
      setErrorBanner(err.message || 'Error al procesar la venta.');
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row gap-6 overflow-hidden">
      {/* LEFT COLUMN: Product Catalog & Fast Search */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search Bar & Scanner Input */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por producto, marca, código SKU o código de barras..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Interactive Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              Todos los productos ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Search className="w-10 h-10 mb-2 text-slate-300" />
              <p className="text-xs font-medium text-slate-600">No se encontraron productos coincidentes</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Intente con otro término o seleccione otra categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStock;
                const cartQty = cart.find((i) => i.product.id === product.id)?.quantity || 0;

                return (
                  <div
                    key={product.id}
                    className={`relative p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isOutOfStock
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Brand and SKU */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-500">{product.brand}</span>
                        <span className="font-mono text-[10px]">{product.sku}</span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2rem]">
                        {product.name}
                      </h4>

                      {/* Stock Indicator */}
                      <div className="mt-2 text-[11px] flex items-center justify-between">
                        <span className="text-slate-500">{product.unit}</span>
                        {isOutOfStock ? (
                          <span className="text-rose-600 font-bold">Agotado</span>
                        ) : isLowStock ? (
                          <span className="text-amber-600 font-semibold font-mono">
                            Stock: {product.stock}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium font-mono">
                            Stock: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Price and Add Button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                        S/. {product.salePrice.toFixed(2)}
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => addToCart(product, 1)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 shrink-0 ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : cartQty > 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{cartQty > 0 ? `${cartQty} en ticket` : 'Agregar'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Ticket & Checkout Drawer */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col shrink-0 overflow-hidden">
        {/* Ticket Header & Voucher Selector */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Ticket de Venta Activo
              </h3>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar</span>
              </button>
            )}
          </div>

          {/* Comprobante Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 rounded-lg">
            <button
              type="button"
              onClick={() => handleReceiptTypeChange('boleta')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                receiptType === 'boleta'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Boleta
            </button>
            <button
              type="button"
              onClick={() => handleReceiptTypeChange('factura')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                receiptType === 'factura'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Factura (RUC)
            </button>
            <button
              type="button"
              onClick={() => handleReceiptTypeChange('ticket')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                receiptType === 'ticket'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nota/Ticket
            </button>
          </div>

          {/* Customer Input Row */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                {receiptType === 'factura' ? 'RUC (11 dígitos)' : 'DNI / Carnet'}
              </label>
              <input
                type="text"
                value={customerDocNumber}
                onChange={(e) => setCustomerDocNumber(e.target.value)}
                placeholder={receiptType === 'factura' ? '206089...' : '4789... (Opcional)'}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                {receiptType === 'factura' ? 'Razón Social' : 'Nombre Cliente'}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={receiptType === 'factura' ? 'Empresa S.A.C.' : 'Cliente mostrador'}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Error Alert inside Cart */}
        {errorBanner && (
          <div className="p-2.5 mx-4 mt-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorBanner}</div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingCart className="w-10 h-10 mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Ticket sin artículos</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Haga clic en los productos del catálogo izquierdo para agregarlos al ticket.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    S/. {item.unitPrice.toFixed(2)} c/u
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center font-mono font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={item.quantity >= item.product.stock}
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 rounded bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right pl-2">
                  <div className="font-mono font-bold text-slate-900 tabular-nums">
                    S/. {item.subtotal.toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary & Checkout Area */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
          {/* Subtotal, IGV, Discount */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Op. Gravada:</span>
              <span className="font-mono tabular-nums">S/. {cartTotals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>I.G.V. (18% inc.):</span>
              <span className="font-mono tabular-nums">S/. {cartTotals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-900 font-bold text-base pt-1 border-t border-slate-200">
              <span>TOTAL A COBRAR:</span>
              <span className="font-mono tabular-nums text-lg text-blue-700">
                S/. {finalPayable.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="block text-[10px] font-semibold uppercase text-slate-500">
              Método de Pago
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`p-2 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'efectivo'
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span className="text-[10px]">Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('yape_plin')}
                className={`p-2 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'yape_plin'
                    ? 'bg-purple-700 text-white shadow-xs font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px]">Yape / Plin</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('tarjeta')}
                className={`p-2 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'tarjeta'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px]">Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transferencia')}
                className={`p-2 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'transferencia'
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-[10px]">Transf.</span>
              </button>
            </div>

            {/* Cash Input & Change Calculation */}
            {paymentMethod === 'efectivo' && (
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 mt-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                    Monto Recibido (S/.):
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={amountPaidStr}
                    onChange={(e) => setAmountPaidStr(e.target.value)}
                    placeholder="0.00"
                    className="w-28 px-2 py-1 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-right text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Quick cash shortcuts */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                  <button
                    type="button"
                    onClick={setExactCash}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium whitespace-nowrap"
                  >
                    Exacto
                  </button>
                  <button
                    type="button"
                    onClick={() => setCash(10)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono whitespace-nowrap"
                  >
                    S/ 10
                  </button>
                  <button
                    type="button"
                    onClick={() => setCash(20)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono whitespace-nowrap"
                  >
                    S/ 20
                  </button>
                  <button
                    type="button"
                    onClick={() => setCash(50)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono whitespace-nowrap"
                  >
                    S/ 50
                  </button>
                  <button
                    type="button"
                    onClick={() => setCash(100)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono whitespace-nowrap"
                  >
                    S/ 100
                  </button>
                </div>

                {/* Live change display */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-slate-600">Vuelto a entregar:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm tabular-nums">
                    S/. {changeToGive.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Sale Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
          >
            <span>Emitir {receiptType === 'factura' ? 'Factura' : 'Boleta'} y Cobrar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Electronic Ticket Modal */}
      <ReceiptModal
        sale={viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        onNewSale={() => {
          setViewingReceipt(null);
          clearCart();
        }}
      />
    </div>
  );
};
