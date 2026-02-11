
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
  stockThreshold?: number; // Per-product threshold
}

export type SalesSource = 'WhatsApp' | 'Instagram' | 'Facebook' | 'Walk-in' | 'Phone Call' | 'Other';
export type PaymentMethod = 'Bookly Wallet' | 'Cash/Transfer';
export type TransactionStatus = 'paid' | 'unpaid' | 'confirmed' | 'cancelled';

export interface SocialOverlayConfig {
  instagram: boolean;
  whatsapp: boolean;
  tiktok: boolean;
  twitter: boolean;
}

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
  deliveryFee: number;
  timestamp: string;
  status: TransactionStatus;
  source: SalesSource;
  paymentMethod: PaymentMethod;
  fee?: number;
  receiptImage?: string;
  variant?: string;
  address?: string;
  isArchived?: boolean;
  editHistory: EditLog[];
  items?: OrderItem[];
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
  paymentMethod?: PaymentMethod;
  items: OrderItem[];
  orderTotal?: number;
  deliveryFee?: number;
  address?: string;
}

export type ExtractedRecordType = 'order' | 'expense';

export interface ExtractedSale {
  intent: 'sale';
  recordType: ExtractedRecordType;
  customerName: string;
  orderItems: OrderItem[];
  total: number;
  paymentMethod?: string;
  deliveryFee?: number;
  platform?: SalesSource;
  confidence: 'high' | 'medium' | 'low';
  customers?: any[]; // For batch support

  // Flat fields for compatibility with UI components
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
  recordType: ExtractedRecordType;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date?: string;
  paymentMethod?: string;
  vendor?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface DashboardWidgets {
  statCards: boolean;
  revenueTrend: boolean;
  topPerformer: boolean;
  quickActions: boolean;
  inventoryHealth: boolean;
  channels: boolean;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  timestamp: string;
  reference: string;
  status: 'success' | 'pending' | 'failed';
  category?: ExpenseCategory; // For debits
  source?: string; // For credits (e.g. "Customer Transfer")
  recipient?: string; // For debits
}

export interface WalletProfile {
  id: string;
  enabled: boolean;
  balance: number;
  currency: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  kycStatus: 'pending' | 'verified' | 'failed';
  kycData?: {
    bvn?: string;
    nin?: string;
    dob?: string;
    fullName?: string;
  };
  pinSet: boolean;
  transactions: WalletTransaction[];
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
  notificationsEnabled: boolean;
  activePlatforms: SalesSource[];
  consentTimestamp?: string;
  dashboardWidgets: DashboardWidgets;
  socialOverlay: SocialOverlayConfig;
  wallet?: WalletProfile; // Linked wallet
}

export type ExtractionResult = ExtractedSale | ExtractedProduct | ExtractedExpense;

export type AppView = 'crm' | 'inventory' | 'settings' | 'onboarding' | 'dashboard' | 'finance' | 'orders' | 'assets';

export interface FilterState {
  customerHandles: string[];
  platforms: SalesSource[];
  status: TransactionStatus[];
  dateRange: {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
  };
  months: number[]; // 0-11
  productNames: string[];
  tiers: ('VIP' | 'Returning' | 'New')[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  timestamp: number;
}
