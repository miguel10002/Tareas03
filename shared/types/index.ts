export type UserRole = 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

export type ProductCategory = 
  | 'Cuadernos y Blocks'
  | 'Escritura y Corrección'
  | 'Papelería y Archivo'
  | 'Arte y Diseño'
  | 'Arte y Dibujo'
  | 'Oficina y Adhesivos'
  | 'Mochilas y Cartucheras';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  brand: string;
  description: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'yape_plin' | 'transferencia';
export type ReceiptType = 'boleta' | 'factura' | 'ticket';

export interface CustomerInfo {
  documentType: 'DNI' | 'RUC' | 'Sin documento';
  documentNumber: string;
  name: string;
  email?: string;
  address?: string;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  receiptType: ReceiptType;
  timestamp: string;
  sellerId: string;
  sellerName: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeGiven: number;
  status: 'completada' | 'anulada';
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'salida_venta' | 'ajuste';
  quantity: number;
  reason: string;
  timestamp: string;
  userName: string;
}

export interface AppState {
  users: User[];
  products: Product[];
  sales: Sale[];
  stockMovements: StockMovement[];
}
