import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../../../shared/types';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  Layers,
  DollarSign
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('all');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(10);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Ingreso de mercadería / Proveedor');

  // New / Edit Form state
  const initialFormState: Omit<Product, 'id'> = {
    sku: '',
    barcode: '',
    name: '',
    category: 'Cuadernos y Blocks',
    brand: '',
    description: '',
    costPrice: 0,
    salePrice: 0,
    stock: 0,
    minStock: 5,
    unit: 'Unidad',
  };
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);

  const categories: ProductCategory[] = [
    'Cuadernos y Blocks',
    'Escritura y Corrección',
    'Papelería y Archivo',
    'Arte y Diseño',
    'Oficina y Adhesivos',
    'Mochilas y Cartucheras',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.brand.toLowerCase().includes(q) ||
        prod.sku.toLowerCase().includes(q) ||
        prod.barcode.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;

      let matchesStock = true;
      if (stockStatusFilter === 'low') {
        matchesStock = prod.stock > 0 && prod.stock <= prod.minStock;
      } else if (stockStatusFilter === 'out') {
        matchesStock = prod.stock <= 0;
      } else if (stockStatusFilter === 'normal') {
        matchesStock = prod.stock > prod.minStock;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockStatusFilter]);

  const handleOpenNewModal = () => {
    setFormData({
      ...initialFormState,
      sku: `UTI-${String(products.length + 1).padStart(3, '0')}`,
      barcode: `775${Math.floor(100000000 + Math.random() * 900000000)}`,
    });
    setFormError(null);
    setIsNewModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      barcode: prod.barcode,
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      description: prod.description,
      costPrice: prod.costPrice,
      salePrice: prod.salePrice,
      stock: prod.stock,
      minStock: prod.minStock,
      unit: prod.unit,
    });
    setFormError(null);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.sku.trim() || !formData.brand.trim()) {
      setFormError('Por favor complete los campos obligatorios: Nombre, Marca y SKU.');
      return;
    }

    if (formData.salePrice <= 0) {
      setFormError('El precio de venta debe ser mayor a 0.');
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...formData,
        id: editingProduct.id,
      });
      setEditingProduct(null);
    } else {
      addProduct(formData);
      setIsNewModalOpen(false);
    }
  };

  const handleDeleteProduct = (prod: Product) => {
    if (window.confirm(`¿Confirma eliminar el producto "${prod.name}" del catálogo?`)) {
      deleteProduct(prod.id);
    }
  };

  const handleConfirmStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    adjustStock(adjustingProduct.id, stockAdjustment, adjustmentReason);
    setAdjustingProduct(null);
    setStockAdjustment(10);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Catálogo e Inventario de Productos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de existencias, precios de compra y venta, márgenes y stock mínimo
          </p>
        </div>
        <button
          onClick={handleOpenNewModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Producto</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, SKU, marca..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        {/* Category filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Stock status filter */}
        <div>
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">Todos los estados de stock</option>
            <option value="normal">Stock Normal</option>
            <option value="low">Stock Bajo (Alerta)</option>
            <option value="out">Agotados (0 uds)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">SKU / Código</th>
                <th className="py-3 px-3">Producto y Marca</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3 text-right">P. Compra</th>
                <th className="py-3 px-3 text-right">P. Venta</th>
                <th className="py-3 px-3 text-right">Margen</th>
                <th className="py-3 px-3 text-center">Stock Actual</th>
                <th className="py-3 px-3 text-center">Mínimo</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => {
                const margin = prod.salePrice > 0 ? (((prod.salePrice - prod.costPrice) / prod.salePrice) * 100).toFixed(0) : '0';
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= prod.minStock;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      <div className="font-semibold text-slate-700">{prod.sku}</div>
                      <div className="text-[10px] text-slate-400">{prod.barcode}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="text-[11px] text-slate-500">{prod.brand} · {prod.unit}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {prod.category}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600 tabular-nums whitespace-nowrap">
                      S/. {prod.costPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      S/. {prod.salePrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-semibold tabular-nums whitespace-nowrap">
                      {margin}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 tabular-nums">
                      {prod.stock}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-500 tabular-nums">
                      {prod.minStock}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Agotado
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                          Stock Bajo
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Óptimo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setAdjustingProduct(prod);
                            setStockAdjustment(10);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded text-[11px] font-semibold transition-colors"
                          title="Ajustar / Reponer existencias"
                        >
                          + Stock
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          title="Editar producto"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nuevo o Editar Producto */}
      {(isNewModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <h3 className="text-sm font-bold tracking-tight">
                {editingProduct ? 'Editar Producto del Catálogo' : 'Registrar Nuevo Producto'}
              </h3>
              <button
                onClick={() => {
                  setIsNewModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej. Resma de Papel Bond A4 75g"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Standford, Faber-Castell, etc."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Compra (S/.)</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Venta (S/.) *</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unidad</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Unidad, Paquete, Caja"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Físico Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alerta Stock Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ajuste Rápido de Stock */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Ajuste de Stock en Almacén
              </h3>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmStockAdjustment} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-400">Producto:</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {adjustingProduct.name}
                </div>
                <div className="text-slate-500 font-mono mt-0.5">
                  Stock actual: {adjustingProduct.stock} {adjustingProduct.unit}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cantidad a sumar (+) o restar (-)
                </label>
                <input
                  type="number"
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-base focus:ring-1 focus:ring-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Nuevo stock resultante:{' '}
                  <span className="font-mono font-bold text-slate-800">
                    {Math.max(0, adjustingProduct.stock + stockAdjustment)} {adjustingProduct.unit}
                  </span>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motivo del Movimiento
                </label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Ingreso de mercadería / Proveedor">Ingreso de mercadería / Proveedor</option>
                  <option value="Devolución de cliente">Devolución de cliente</option>
                  <option value="Ajuste por inventario físico">Ajuste por inventario físico</option>
                  <option value="Merma o producto dañado">Merma o producto dañado</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
