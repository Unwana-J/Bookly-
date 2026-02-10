
export interface ProductVariant {
  id: string;
  name: string; // e.g., "Large / Red"
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number; // For Profit calculation
  stock: number; // Total stock or sum of variants
  totalSales: number;
  category: string;
  description?: string;
  image?: string;
  variants?: ProductVariant[];
}

export type SalesSource = 'WhatsApp' | 'Instagram' | 'Facebook' | 'Walk-in' | 'Phone Call' | 'Other';

export interface Customer {
  id: string;
  handle: string;
  name: string;
  orderCount: number;
  ltv: number;
  channel: SalesSource;
  lastActive: string;
  address?: string;
}

export interface EditLog {
  timestamp: string;
  description: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerHandle: string;
  productId: string;
  productName: string;
  quantity: number;
  total: number;
  costTotal: number; // Stored cost at time of sale
  timestamp: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  source: SalesSource;
  receiptImage?: string;
  variant?: string;
  address?: string;
  isArchived?: boolean;
  editHistory?: EditLog[];
}

export type ExpenseCategory = 'Logistics' | 'Marketing' | 'Supplies' | 'Rent' | 'Utilities' | 'Salary' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  timestamp: string;
  receiptImage?: string;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  variant?: string;
  unitPrice?: number;
  costPrice?: number;
}

export interface ExtractedCustomerSale {
  handle: string;
  platform?: SalesSource;
  items: OrderItem[];
  orderTotal?: number;
  address?: string;
}

export interface ExtractedSale {
  intent: 'sale';
  orderType: 'single' | 'batch';
  customers: ExtractedCustomerSale[];
  batchTotal?: number;
  confidence: 'high' | 'medium' | 'low';
  
  // Flat fields for compatibility with UI components that display/edit single sales
  customerHandle?: string;
  items?: OrderItem[];
  totalPrice?: number;
  date?: string;
  source?: SalesSource;
  receiptImage?: string;
}

export interface ExtractedProduct {
  intent: 'product';
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  category: string;
  description?: string;
  variants?: ProductVariant[];
  confidence: 'high' | 'medium' | 'low';
}

export interface ExtractedExpense {
  intent: 'expense';
  amount: number;
  category: ExpenseCategory;
  description: string;
  date?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface BusinessProfile {
  name: string;
  email: string;
  phone: string;
  logo?: string;
  currency: string;
  receiptFooter: string;
  archetype: string;
  defaultSalesSource?: SalesSource;
  vipThreshold: number; 
  stockThreshold: number;
  persistenceMode: 'cloud' | 'local';
  whatsappSyncEnabled: boolean;
  activePlatforms: SalesSource[];
  consentTimestamp?: string;
}

export interface ContextItem {
  id: string;
  type: 'text' | 'image';
  content: string; // text or base64
  timestamp: number;
  sourceHint?: SalesSource;
}

export type ExtractionResult = ExtractedSale | ExtractedProduct | ExtractedExpense;

export type AppView = 'inventory' | 'crm' | 'settings' | 'onboarding' | 'dashboard' | 'expenses' | 'sales';

export interface FilterState {
  customerHandles: string[];
  platforms: SalesSource[];
  dateRange: {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
  };
  months: number[]; // 0-11
  productNames: string[];
  tiers: ('VIP' | 'Returning' | 'New')[];
}

// Added more functional Widget types
export type WidgetType = 
  | 'revenue' 
  | 'overhead' 
  | 'profit' 
  | 'contacts' 
  | 'channels' 
  | 'burn' 
  | 'top_products' 
  | 'pulse' 
  | 'quick_actions' 
  | 'inventory_status';

export interface DashboardWidget {
  id: WidgetType;
  label: string;
  visible: boolean;
  size: 'small' | 'large';
  description?: string;
}
