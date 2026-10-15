// Wholesale Jewellery Management System Data Models

export interface Item {
  id: string;
  user_id?: string;
  name: string;
  sku?: string;
  category: string;
  purchase_rate: number;
  default_sale_rate: number;
  current_stock: number;
  opening_stock: number;
  low_stock_threshold: number;
  description?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus =
  | 'Advance Paid'
  | 'Due Balance'
  | 'Payment Complete'
  | 'Paid'
  | 'Partially Paid'
  | 'Unpaid';

// --- WHOLESALE PURCHASE MODELS ---
export interface PurchaseItem {
  id?: string;
  purchase_id?: string;
  item_id?: string;
  item_name: string;
  quantity: number;
  unit_purchase_rate: number;
  gst_rate: number; // e.g. 3 for jewellery (1.5% CGST + 1.5% SGST or 3% IGST)
  taxable_amount: number;
  gst_amount: number;
  line_total: number;
}

export interface Purchase {
  id: string;
  user_id?: string;
  purchase_date: string;
  supplier_name: string;
  supplier_gstin?: string;
  supplier_invoice_number: string;
  is_interstate?: boolean;
  total_taxable: number;
  total_gst: number;
  grand_total: number;
  payment_status: PaymentStatus;
  amount_paid: number;
  amount_due: number;
  notes?: string;
  status: 'active' | 'cancelled';
  created_at: string;
  updated_at: string;
  items?: PurchaseItem[];
}

// --- WHOLESALE SALE & INVOICE MODELS ---
export interface SaleItem {
  id?: string;
  sale_id?: string;
  item_id?: string;
  item_name: string;
  quantity: number;
  unit_cost: number; // Historical purchase cost snapshot
  unit_sale_rate: number;
  gst_rate: number; // e.g. 3% for jewellery
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  gst_amount: number;
  line_total: number;
  line_cost: number;
  line_profit: number;
}

export interface SalePayment {
  id: string;
  sale_id: string;
  payment_date: string;
  amount: number;
  payment_method?: string;
  notes?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  user_id?: string;
  invoice_number: string;
  sale_date: string;
  customer_name: string;
  buyer_gstin?: string;
  buyer_address?: string;
  customer_phone?: string;
  is_interstate: boolean; // false = CGST + SGST, true = IGST
  payment_method: string;
  payment_status: PaymentStatus;
  total_taxable: number;
  total_cgst: number;
  total_sgst: number;
  total_igst: number;
  total_gst: number;
  grand_total: number;
  total_cost: number; // COGS
  gross_profit: number;
  amount_received: number;
  amount_due: number;
  notes?: string;
  status: 'completed' | 'voided';
  void_reason?: string;
  created_at: string;
  updated_at: string;
  items?: SaleItem[];
  payments?: SalePayment[];
}

// --- OPERATING EXPENSES ---
export type ExpenseCategory =
  | 'Rent'
  | 'Electricity'
  | 'Salary'
  | 'Transport'
  | 'Packaging'
  | 'Repairs'
  | 'Internet / Phone'
  | 'Other';

export interface Expense {
  id: string;
  user_id?: string;
  expense_date: string;
  title: string;
  category: ExpenseCategory | string;
  amount: number;
  payment_status?: PaymentStatus;
  payment_method: string;
  notes?: string;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

// --- BUSINESS SETTINGS ---
export interface BusinessSettings {
  id: string;
  user_id?: string;
  business_name: string;
  hindi_header: string;
  tagline: string;
  business_address?: string;
  business_gstin?: string;
  state?: string;
  phone?: string;
  currency: string;
  currency_symbol: string;
  default_gst_rate: number; // default 3%
  invoice_prefix: string;
  next_invoice_number: number;
  invoice_notes?: string;
  updated_at: string;
}

// --- INVENTORY MOVEMENT & PERIOD LEDGER ---
export interface StockMovementPeriod {
  item_id: string;
  item_name: string;
  category: string;
  opening_stock: number;
  purchased_qty: number;
  sold_qty: number;
  current_stock: number;
  purchase_rate: number;
  default_sale_rate: number;
  stock_value: number;
}

// --- SIMPLIFIED WHOLESALE DASHBOARD STATS ---
export interface WholesaleDashboardStats {
  month_sales: number;
  month_purchases: number;
  current_stock_units: number;
  current_stock_value: number;
  month_income: number;
  month_expenditure: number;
  month_net_result: number;
}

// --- 5 MAIN NAVIGATION FEATURES ---
export type ActiveNavTab =
  | 'dashboard'
  | 'create_sale'
  | 'create_purchase'
  | 'inventory'
  | 'reports'
  | 'settings'
  | 'backup'
  // Legacy aliases
  | 'purchase'
  | 'sales'
  | 'invoices'
  | 'accounts';

export type DateFilterPreset =
  | 'today'
  | 'this_month'
  | 'last_month'
  | 'financial_year'
  | 'custom';
