import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Product, 
  Sale, 
  CartItem, 
  CustomerInfo, 
  ReceiptType, 
  PaymentMethod, 
  StockMovement, 
  UserRole,
  AppState,
} from '../../../shared/types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_SALES } from '../../../shared/data/initialData';

interface AppContextType {
  isReady: boolean;
  currentUser: User | null;
  users: User[];
  currentView: string;
  setCurrentView: (view: string) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  quickLoginAs: (role: UserRole) => void;

  products: Product[];
  lowStockProducts: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  adjustStock: (productId: string, delta: number, reason: string) => void;

  sales: Sale[];
  completeSale: (params: {
    customer: CustomerInfo;
    receiptType: ReceiptType;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    discount: number;
  }) => Sale;
  cancelSale: (saleId: string) => void;

  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => { success: boolean; message?: string };
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotals: {
    subtotal: number;
    tax: number;
    total: number;
    itemCount: number;
  };

  viewingReceipt: Sale | null;
  setViewingReceipt: (sale: Sale | null) => void;

  resetToDemoData: () => void;
  stockMovements: StockMovement[];
  addUser: (userData: Omit<User, 'id'>) => void;
  toggleUserStatus: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  // Authentication & Users
  const [users, setUsers] = useState<User[]>(() => readStoredValue('utiles_users', INITIAL_USERS));

  const [currentUser, setCurrentUser] = useState<User | null>(() => readStoredValue('utiles_active_user', null));

  // Current Screen / View
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Products & Inventory
  const [products, setProducts] = useState<Product[]>(() => readStoredValue('utiles_products', INITIAL_PRODUCTS));

  // Sales
  const [sales, setSales] = useState<Sale[]>(() => readStoredValue('utiles_sales', INITIAL_SALES));

  // Stock movements log
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => readStoredValue('utiles_movements', []));

  // POS Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [viewingReceipt, setViewingReceipt] = useState<Sale | null>(null);

  // Hydrate from the backend; localStorage remains an offline fallback.
  useEffect(() => {
    let active = true;
    fetch('/api/state')
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar el estado del servidor.');
        return response.json() as Promise<AppState>;
      })
      .then((state) => {
        if (!active) return;
        setUsers(state.users);
        setProducts(state.products);
        setSales(state.sales);
        setStockMovements(state.stockMovements);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const state: AppState = { users, products, sales, stockMovements };
    localStorage.setItem('utiles_products', JSON.stringify(products));
    localStorage.setItem('utiles_sales', JSON.stringify(sales));
    localStorage.setItem('utiles_users', JSON.stringify(users));
    localStorage.setItem('utiles_movements', JSON.stringify(stockMovements));

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
        signal: controller.signal,
      }).catch(() => undefined);
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isReady, users, products, sales, stockMovements]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('utiles_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('utiles_active_user');
    }
  }, [currentUser]);

  // Derived low stock items
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  // Auth Methods
  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const result = await response.json() as { user?: User; message?: string };
      if (!response.ok || !result.user) {
        return { success: false, message: result.message || 'No se pudo iniciar sesión.' };
      }

      setCurrentUser(result.user);
      setUsers((prev) => prev.map((user) => user.id === result.user?.id ? result.user! : user));
      setCurrentView('dashboard');
      return { success: true };
    } catch {
      return { success: false, message: 'No se pudo conectar con el servidor.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    setCart([]);
  };

  const switchRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role && u.status === 'active') || {
      id: role === 'admin' ? 'usr-2' : 'usr-1',
      name: role === 'admin' ? 'Laura Mendoza' : 'Carlos Díaz',
      email: role === 'admin' ? 'admin@utilesexpress.pe' : 'vendedor@utilesexpress.pe',
      role,
      status: 'active' as const,
      phone: '+51 984 123 456',
    };
    setCurrentUser(targetUser);
    setCurrentView('dashboard');
  };

  const quickLoginAs = (role: UserRole) => {
    const user = users.find((u) => u.role === role && u.status === 'active') || INITIAL_USERS.find((u) => u.role === role)!;
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  // Cart Methods
  const addToCart = (product: Product, qty: number = 1): { success: boolean; message?: string } => {
    const existing = cart.find((item) => item.product.id === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;
    const requestedQty = currentQtyInCart + qty;

    if (requestedQty > product.stock) {
      return {
        success: false,
        message: `Stock insuficiente. Disponibles: ${product.stock} ${product.unit}`,
      };
    }

    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: requestedQty,
                subtotal: Number((requestedQty * item.unitPrice).toFixed(2)),
              }
            : item
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          product,
          quantity: qty,
          unitPrice: product.salePrice,
          subtotal: Number((qty * product.salePrice).toFixed(2)),
        },
      ]);
    }
    return { success: true };
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (quantity > prod.stock) {
      quantity = prod.stock;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              subtotal: Number((quantity * item.unitPrice).toFixed(2)),
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart calculations (IGV 18% included in final retail prices in Peru)
  const cartTotals = React.useMemo(() => {
    const total = Number(cart.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    const subtotal = Number((total / 1.18).toFixed(2));
    const tax = Number((total - subtotal).toFixed(2));
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { total, subtotal, tax, itemCount };
  }, [cart]);

  // Complete Sale
  const completeSale = (params: {
    customer: CustomerInfo;
    receiptType: ReceiptType;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    discount: number;
  }): Sale => {
    const nextNum = sales.length + 1;
    const prefix = params.receiptType === 'factura' ? 'F001' : 'B001';
    const receiptNumber = `${prefix}-${String(nextNum).padStart(6, '0')}`;

    const grossTotal = cartTotals.total;
    const finalTotal = Math.max(0, Number((grossTotal - params.discount).toFixed(2)));
    const subtotal = Number((finalTotal / 1.18).toFixed(2));
    const tax = Number((finalTotal - subtotal).toFixed(2));
    const changeGiven = params.paymentMethod === 'efectivo' 
      ? Math.max(0, Number((params.amountPaid - finalTotal).toFixed(2)))
      : 0;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      receiptNumber,
      receiptType: params.receiptType,
      timestamp: new Date().toISOString(),
      sellerId: currentUser?.id || 'usr-1',
      sellerName: currentUser?.name || 'Vendedor Mostrador',
      customer: params.customer,
      items: [...cart],
      subtotal,
      tax,
      discount: params.discount,
      total: finalTotal,
      paymentMethod: params.paymentMethod,
      amountPaid: params.paymentMethod === 'efectivo' ? params.amountPaid : finalTotal,
      changeGiven,
      status: 'completada',
    };

    // Deduct stock for all items
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((ci) => ci.product.id === prod.id);
        if (cartItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - cartItem.quantity),
          };
        }
        return prod;
      })
    );

    // Record stock movements
    const newMovements: StockMovement[] = cart.map((ci) => ({
      id: `mov-${Date.now()}-${ci.product.id}`,
      productId: ci.product.id,
      productName: ci.product.name,
      type: 'salida_venta',
      quantity: ci.quantity,
      reason: `Venta ${receiptNumber}`,
      timestamp: new Date().toISOString(),
      userName: currentUser?.name || 'Vendedor',
    }));

    setStockMovements((prev) => [...newMovements, ...prev]);
    setSales((prev) => [newSale, ...prev]);
    clearCart();
    setViewingReceipt(newSale);

    return newSale;
  };

  const cancelSale = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.status === 'anulada') return;

    // Rollback stock
    setProducts((prev) =>
      prev.map((prod) => {
        const item = sale.items.find((i) => i.product.id === prod.id);
        if (item) {
          return {
            ...prod,
            stock: prod.stock + item.quantity,
          };
        }
        return prod;
      })
    );

    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, status: 'anulada' } : s))
    );

    // Record movement
    const rollbackMovements: StockMovement[] = sale.items.map((i) => ({
      id: `mov-${Date.now()}-${i.product.id}`,
      productId: i.product.id,
      productName: i.product.name,
      type: 'entrada',
      quantity: i.quantity,
      reason: `Anulación de venta ${sale.receiptNumber}`,
      timestamp: new Date().toISOString(),
      userName: currentUser?.name || 'Administrador',
    }));
    setStockMovements((prev) => [...rollbackMovements, ...prev]);
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: newProd.id,
      productName: newProd.name,
      type: 'entrada',
      quantity: newProd.stock,
      reason: 'Registro inicial de producto',
      timestamp: new Date().toISOString(),
      userName: currentUser?.name || 'Administrador',
    };
    setStockMovements((prev) => [movement, ...prev]);
    return newProd;
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const adjustStock = (productId: string, delta: number, reason: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newStock = Math.max(0, prod.stock + delta);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      type: delta >= 0 ? 'entrada' : 'ajuste',
      quantity: Math.abs(delta),
      reason,
      timestamp: new Date().toISOString(),
      userName: currentUser?.name || 'Administrador',
    };
    setStockMovements((prev) => [movement, ...prev]);
  };

  // Users management
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
          : u
      )
    );
  };

  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setSales(INITIAL_SALES);
    setUsers(INITIAL_USERS);
    setStockMovements([]);
    setCart([]);
    localStorage.removeItem('utiles_products');
    localStorage.removeItem('utiles_sales');
    localStorage.removeItem('utiles_users');
    localStorage.removeItem('utiles_movements');
  };

  return (
    <AppContext.Provider
      value={{
        isReady,
        currentUser,
        users,
        currentView,
        setCurrentView,
        login,
        logout,
        switchRole,
        quickLoginAs,
        products,
        lowStockProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        sales,
        completeSale,
        cancelSale,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotals,
        viewingReceipt,
        setViewingReceipt,
        resetToDemoData,
        stockMovements,
        addUser,
        toggleUserStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
