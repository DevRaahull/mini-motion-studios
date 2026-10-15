import { getSupabaseClient } from './supabase';
import { Item, Sale, SaleItem, Purchase, PurchaseItem, Expense, BusinessSettings, StockMovementPeriod } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'SSJ_SETTINGS',
  ITEMS: 'SSJ_ITEMS',
  PURCHASES: 'SSJ_PURCHASES',
  SALES: 'SSJ_SALES',
  EXPENSES: 'SSJ_EXPENSES'
};

const DEFAULT_SETTINGS: BusinessSettings = {
  id: 'default',
  business_name: 'SEVEN STAR JWELS',
  hindi_header: '॥ श्री ॥',
  tagline: 'Jewellery Inventory & Accounting',
  business_address: 'Shop No. 7, Jewel Market, Zaveri Bazaar, Mumbai - 400002',
  business_gstin: '27AABCU9603R1ZM',
  state: 'Maharashtra',
  phone: '+91 98765 43210',
  currency: 'INR',
  currency_symbol: '₹',
  default_gst_rate: 3.00,
  invoice_prefix: 'SSJ-',
  next_invoice_number: 2026008,
  invoice_notes: 'Goods once sold will not be exchanged without cash receipt. Quality Builds Trust.',
  updated_at: new Date().toISOString()
};

// Seed initial wholesale inventory items
const INITIAL_SEED_ITEMS: Item[] = [
  {
    id: 'item-1',
    name: 'CZ Stone Studded Nose Pin 92.5',
    sku: 'NP-STN-001',
    category: 'Nose Pins',
    purchase_rate: 110.00,
    default_sale_rate: 150.00,
    opening_stock: 50,
    current_stock: 45,
    low_stock_threshold: 5,
    description: 'Wholesale 92.5 Sterling silver CZ nose pins',
    is_archived: false,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-03-08T10:00:00Z'
  },
  {
    id: 'item-2',
    name: 'Silver Floral Nose Pin Oxidised',
    sku: 'NP-FLR-002',
    category: 'Nose Pins',
    purchase_rate: 100.00,
    default_sale_rate: 150.00,
    opening_stock: 35,
    current_stock: 32,
    low_stock_threshold: 5,
    description: 'Oxidised floral silver wholesale pieces',
    is_archived: false,
    created_at: '2026-02-05T11:00:00Z',
    updated_at: '2026-03-06T11:00:00Z'
  },
  {
    id: 'item-3',
    name: 'Lightweight Daily Wear Silver Earrings',
    sku: 'ER-JHM-003',
    category: 'Earrings',
    purchase_rate: 110.00,
    default_sale_rate: 150.00,
    opening_stock: 25,
    current_stock: 18,
    low_stock_threshold: 5,
    description: 'Bulk silver jhumki style daily earrings',
    is_archived: false,
    created_at: '2026-02-10T12:00:00Z',
    updated_at: '2026-03-03T12:00:00Z'
  },
  {
    id: 'item-4',
    name: 'Solitaire Finish Silver Band Ring',
    sku: 'RG-SLV-004',
    category: 'Rings',
    purchase_rate: 260.00,
    default_sale_rate: 350.00,
    opening_stock: 20,
    current_stock: 14,
    low_stock_threshold: 4,
    description: 'Wholesale adjustable band rings',
    is_archived: false,
    created_at: '2026-02-12T14:00:00Z',
    updated_at: '2026-02-28T14:00:00Z'
  }
];

// Seed initial wholesale purchases
const INITIAL_SEED_PURCHASES: Purchase[] = [
  {
    id: 'pur-1',
    purchase_date: '2026-03-01T11:00:00Z',
    supplier_name: 'Shree Balaji Silver Refinery',
    supplier_gstin: '27AAACS1234F1Z9',
    supplier_invoice_number: 'BSR-9841',
    is_interstate: false,
    total_taxable: 1922.33,
    total_gst: 57.67,
    grand_total: 1980.00,
    payment_status: 'Paid',
    amount_paid: 1980.00,
    amount_due: 0.00,
    notes: 'Bulk stock inward batch #1',
    status: 'active',
    created_at: '2026-03-01T11:00:00Z',
    updated_at: '2026-03-01T11:00:00Z',
    items: [
      {
        id: 'pitem-1',
        purchase_id: 'pur-1',
        item_id: 'item-1',
        item_name: 'CZ Stone Studded Nose Pin 92.5',
        quantity: 10,
        unit_purchase_rate: 110.00,
        gst_rate: 3.00,
        taxable_amount: 1100.00,
        gst_amount: 33.00,
        line_total: 1133.00
      },
      {
        id: 'pitem-2',
        purchase_id: 'pur-1',
        item_id: 'item-2',
        item_name: 'Silver Floral Nose Pin Oxidised',
        quantity: 8,
        unit_purchase_rate: 100.00,
        gst_rate: 3.00,
        taxable_amount: 800.00,
        gst_amount: 24.00,
        line_total: 824.00
      }
    ]
  }
];

// Seed initial wholesale sales
const INITIAL_SEED_SALES: Sale[] = [
  {
    id: 'sale-1',
    invoice_number: 'SSJ-2026007',
    sale_date: '2026-03-08T16:30:00Z',
    customer_name: 'Pooja Verma Jewellers',
    buyer_gstin: '27AABCP4432G1Z3',
    buyer_address: 'Main Bazaar, Pune',
    customer_phone: '9820011223',
    is_interstate: false,
    payment_method: 'Cash',
    payment_status: 'Payment Complete',
    total_taxable: 728.16,
    total_cgst: 10.92,
    total_sgst: 10.92,
    total_igst: 0.00,
    total_gst: 21.84,
    grand_total: 750.00,
    total_cost: 550.00,
    gross_profit: 178.16,
    amount_received: 750.00,
    amount_due: 0.00,
    notes: 'Bulk counter wholesale delivery',
    status: 'completed',
    created_at: '2026-03-08T16:30:00Z',
    updated_at: '2026-03-08T16:30:00Z',
    items: [
      {
        id: 'sitem-1',
        sale_id: 'sale-1',
        item_id: 'item-1',
        item_name: 'CZ Stone Studded Nose Pin 92.5',
        quantity: 5,
        unit_cost: 110.00,
        unit_sale_rate: 145.63,
        gst_rate: 3.00,
        taxable_amount: 728.16,
        cgst_amount: 10.92,
        sgst_amount: 10.92,
        igst_amount: 0.00,
        gst_amount: 21.84,
        line_total: 750.00,
        line_cost: 550.00,
        line_profit: 178.16
      }
    ],
    payments: [
      {
        id: 'spay-1',
        sale_id: 'sale-1',
        payment_date: '2026-03-08T16:30:00Z',
        amount: 750.00,
        payment_method: 'Cash',
        notes: 'Full payment received at counter',
        created_at: '2026-03-08T16:30:00Z'
      }
    ]
  },
  {
    id: 'sale-2',
    invoice_number: 'SSJ-2026006',
    sale_date: '2026-03-06T14:15:00Z',
    customer_name: 'Anjali Sharma Arts',
    buyer_gstin: '',
    buyer_address: 'Bandra, Mumbai',
    customer_phone: '9819988776',
    is_interstate: false,
    payment_method: 'UPI',
    payment_status: 'Payment Complete',
    total_taxable: 436.89,
    total_cgst: 6.55,
    total_sgst: 6.55,
    total_igst: 0.00,
    total_gst: 13.11,
    grand_total: 450.00,
    total_cost: 300.00,
    gross_profit: 136.89,
    amount_received: 450.00,
    amount_due: 0.00,
    notes: 'UPI payment received',
    status: 'completed',
    created_at: '2026-03-06T14:15:00Z',
    updated_at: '2026-03-06T14:15:00Z',
    items: [
      {
        id: 'sitem-2',
        sale_id: 'sale-2',
        item_id: 'item-2',
        item_name: 'Silver Floral Nose Pin Oxidised',
        quantity: 3,
        unit_cost: 100.00,
        unit_sale_rate: 145.63,
        gst_rate: 3.00,
        taxable_amount: 436.89,
        cgst_amount: 6.55,
        sgst_amount: 6.55,
        igst_amount: 0.00,
        gst_amount: 13.11,
        line_total: 450.00,
        line_cost: 300.00,
        line_profit: 136.89
      }
    ],
    payments: [
      {
        id: 'spay-2',
        sale_id: 'sale-2',
        payment_date: '2026-03-06T14:15:00Z',
        amount: 450.00,
        payment_method: 'UPI',
        notes: 'UPI instant settlement',
        created_at: '2026-03-06T14:15:00Z'
      }
    ]
  }
];

const INITIAL_SEED_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    expense_date: '2026-03-02T10:00:00Z',
    title: 'Packaging Pouches & Velvet Display Trays',
    category: 'Packaging',
    amount: 120.00,
    payment_method: 'Cash',
    payment_status: 'Paid',
    notes: 'Wholesale jewellery packing',
    is_cancelled: false,
    created_at: '2026-03-02T10:00:00Z',
    updated_at: '2026-03-02T10:00:00Z'
  },
  {
    id: 'exp-2',
    expense_date: '2026-03-05T15:00:00Z',
    title: 'Silver Cleaning Solution & Karigar Touchstone',
    category: 'Repairs',
    amount: 80.00,
    payment_method: 'Cash',
    payment_status: 'Paid',
    notes: 'Workshop consumables',
    is_cancelled: false,
    created_at: '2026-03-05T15:00:00Z',
    updated_at: '2026-03-05T15:00:00Z'
  }
];

class StorageService {
  private isBrowser = typeof window !== 'undefined';

  private getFromLocal<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser) return defaultValue;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private saveToLocal(key: string, data: any): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
    }
  }

  // --- SETTINGS ---
  async getSettings(): Promise<BusinessSettings> {
    const client = getSupabaseClient();
    if (client) {
      const { data } = await client.from('business_settings').select('*').limit(1).maybeSingle();
      if (data) return data;
    }
    return this.getFromLocal<BusinessSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  async updateSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const current = await this.getSettings();
    const updated: BusinessSettings = { ...current, ...settings, updated_at: new Date().toISOString() };
    const client = getSupabaseClient();
    if (client) {
      await client.from('business_settings').upsert(updated);
    }
    this.saveToLocal(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // --- ITEMS & INVENTORY ---
  async getItems(): Promise<Item[]> {
    const client = getSupabaseClient();
    if (client) {
      const { data } = await client.from('items').select('*').order('name', { ascending: true });
      if (data) return data;
    }
    let local = this.getFromLocal<Item[] | null>(STORAGE_KEYS.ITEMS, null);
    if (!local) {
      local = INITIAL_SEED_ITEMS;
      this.saveToLocal(STORAGE_KEYS.ITEMS, local);
    }
    return local;
  }

  async saveItem(itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Item> {
    const client = getSupabaseClient();
    const now = new Date().toISOString();
    const id = itemData.id || `item-${Date.now()}`;

    const itemRecord: Item = {
      id,
      name: itemData.name.trim(),
      sku: itemData.sku?.trim() || undefined,
      category: itemData.category || 'General',
      purchase_rate: Number(itemData.purchase_rate) || 0,
      default_sale_rate: Number(itemData.default_sale_rate) || 0,
      current_stock: Number(itemData.current_stock) || 0,
      opening_stock: Number(itemData.opening_stock) || 0,
      low_stock_threshold: Number(itemData.low_stock_threshold) ?? 5,
      description: itemData.description || '',
      is_archived: itemData.is_archived || false,
      created_at: now,
      updated_at: now
    };

    if (client) {
      const { data } = await client.from('items').upsert(itemRecord).select().single();
      if (data) return data;
    }

    const items = await this.getItems();
    const index = items.findIndex(i => i.id === id);
    if (index >= 0) {
      items[index] = { ...items[index], ...itemRecord, updated_at: now };
    } else {
      items.push(itemRecord);
    }
    this.saveToLocal(STORAGE_KEYS.ITEMS, items);
    return itemRecord;
  }

  async adjustStock(itemId: string, quantityChange: number, reason: string): Promise<Item> {
    const items = await this.getItems();
    const item = items.find(i => i.id === itemId);
    if (!item) throw new Error('Item not found');
    const newStock = Math.max(0, item.current_stock + quantityChange);
    return await this.saveItem({ ...item, current_stock: newStock });
  }

  async archiveOrDeleteItem(itemId: string, action: 'archive' | 'unarchive' | 'delete'): Promise<void> {
    const items = await this.getItems();
    if (action === 'delete') {
      this.saveToLocal(STORAGE_KEYS.ITEMS, items.filter(i => i.id !== itemId));
      const client = getSupabaseClient();
      if (client) await client.from('items').delete().eq('id', itemId);
    } else {
      const item = items.find(i => i.id === itemId);
      if (item) {
        await this.saveItem({ ...item, is_archived: action === 'archive' });
      }
    }
  }

  // --- WHOLESALE PURCHASES ---
  async getPurchases(): Promise<Purchase[]> {
    const client = getSupabaseClient();
    if (client) {
      const { data } = await client.from('purchases').select('*, items:purchase_items(*)').order('purchase_date', { ascending: false });
      if (data) return data;
    }
    let local = this.getFromLocal<Purchase[] | null>(STORAGE_KEYS.PURCHASES, null);
    if (!local) {
      local = INITIAL_SEED_PURCHASES;
      this.saveToLocal(STORAGE_KEYS.PURCHASES, local);
    }
    return local;
  }

  async createPurchase(
    purchaseData: {
      purchase_date: string;
      supplier_name: string;
      supplier_gstin?: string;
      supplier_invoice_number: string;
      is_interstate?: boolean;
      amount_paid: number;
      notes?: string;
    },
    itemsData: Array<{
      item_name: string;
      item_id?: string;
      quantity: number;
      unit_purchase_rate: number;
      gst_rate?: number;
    }>
  ): Promise<Purchase> {
    if (!itemsData || itemsData.length === 0) {
      throw new Error('Purchase entry must contain at least one item.');
    }

    const allItems = await this.getItems();
    const now = new Date().toISOString();
    const purchaseId = `pur-${Date.now()}`;

    let totalTaxable = 0;
    let totalGst = 0;

    const purchaseLines: PurchaseItem[] = [];

    // Process line items and auto-add new items to inventory
    for (const line of itemsData) {
      const qty = Number(line.quantity) || 1;
      const rate = Number(line.unit_purchase_rate) || 0;
      const gstRate = Number(line.gst_rate ?? 3.00);

      const lineTaxable = Math.round(qty * rate * 100) / 100;
      const lineGst = Math.round((lineTaxable * (gstRate / 100)) * 100) / 100;
      const lineTotal = Math.round((lineTaxable + lineGst) * 100) / 100;

      totalTaxable += lineTaxable;
      totalGst += lineGst;

      // Find or create item
      let matchedItem = allItems.find(i => 
        (line.item_id && i.id === line.item_id) || 
        i.name.toLowerCase().trim() === line.item_name.toLowerCase().trim()
      );

      if (!matchedItem) {
        // Automatically add new item to inventory directly from purchase!
        matchedItem = {
          id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: line.item_name.trim(),
          category: 'General',
          purchase_rate: rate,
          default_sale_rate: Math.round(rate * 1.35 * 100) / 100, // 35% default markup
          opening_stock: 0,
          current_stock: qty,
          low_stock_threshold: 5,
          is_archived: false,
          created_at: now,
          updated_at: now
        };
        allItems.push(matchedItem);
      } else {
        // Increase existing stock & update latest purchase rate
        matchedItem.current_stock += qty;
        matchedItem.purchase_rate = rate;
        matchedItem.updated_at = now;
      }

      purchaseLines.push({
        id: `pitem-${purchaseId}-${purchaseLines.length + 1}`,
        purchase_id: purchaseId,
        item_id: matchedItem.id,
        item_name: matchedItem.name,
        quantity: qty,
        unit_purchase_rate: rate,
        gst_rate: gstRate,
        taxable_amount: lineTaxable,
        gst_amount: lineGst,
        line_total: lineTotal
      });
    }

    const grandTotal = Math.round((totalTaxable + totalGst) * 100) / 100;
    const amountPaid = Math.min(grandTotal, Number(purchaseData.amount_paid) || 0);
    const amountDue = Math.max(0, Math.round((grandTotal - amountPaid) * 100) / 100);

    let paymentStatus: 'Paid' | 'Partially Paid' | 'Unpaid' = 'Paid';
    if (amountPaid <= 0) paymentStatus = 'Unpaid';
    else if (amountPaid < grandTotal) paymentStatus = 'Partially Paid';

    const newPurchase: Purchase = {
      id: purchaseId,
      purchase_date: purchaseData.purchase_date,
      supplier_name: purchaseData.supplier_name.trim(),
      supplier_gstin: purchaseData.supplier_gstin?.trim() || undefined,
      supplier_invoice_number: purchaseData.supplier_invoice_number.trim(),
      is_interstate: !!purchaseData.is_interstate,
      total_taxable: totalTaxable,
      total_gst: totalGst,
      grand_total: grandTotal,
      payment_status: paymentStatus,
      amount_paid: amountPaid,
      amount_due: amountDue,
      notes: purchaseData.notes?.trim() || undefined,
      status: 'active',
      created_at: now,
      updated_at: now,
      items: purchaseLines
    };

    // Save updated items & purchases
    this.saveToLocal(STORAGE_KEYS.ITEMS, allItems);
    const purchases = await this.getPurchases();
    purchases.unshift(newPurchase);
    this.saveToLocal(STORAGE_KEYS.PURCHASES, purchases);

    const client = getSupabaseClient();
    if (client) {
      await client.from('purchases').insert(newPurchase);
      await client.from('purchase_items').insert(purchaseLines);
      await client.from('items').upsert(allItems);
    }

    return newPurchase;
  }

  async deletePurchase(purchaseId: string): Promise<void> {
    const purchases = await this.getPurchases();
    const purchaseIndex = purchases.findIndex(p => p.id === purchaseId);
    if (purchaseIndex === -1) throw new Error('Purchase bill not found');

    const purchase = purchases[purchaseIndex];
    const items = await this.getItems();
    const itemMap = new Map(items.map(i => [i.id, i]));
    const now = new Date().toISOString();

    // Revert inward stock from items
    if (purchase.items && purchase.items.length > 0) {
      for (const line of purchase.items) {
        let item: Item | undefined;
        if (line.item_id && itemMap.has(line.item_id)) {
          item = itemMap.get(line.item_id);
        } else {
          item = items.find(i => i.name.toLowerCase().trim() === line.item_name.toLowerCase().trim());
        }

        if (item) {
          item.current_stock = Math.max(0, item.current_stock - line.quantity);
          item.updated_at = now;
        }
      }
      this.saveToLocal(STORAGE_KEYS.ITEMS, items);
    }

    // Remove purchase
    purchases.splice(purchaseIndex, 1);
    this.saveToLocal(STORAGE_KEYS.PURCHASES, purchases);

    const client = getSupabaseClient();
    if (client) {
      await client.from('purchase_items').delete().eq('purchase_id', purchaseId);
      await client.from('purchases').delete().eq('id', purchaseId);
      await client.from('items').upsert(items);
    }
  }

  // --- WHOLESALE SALES & BILLING ---
  async getSales(): Promise<Sale[]> {
    const client = getSupabaseClient();
    if (client) {
      const { data } = await client
        .from('sales')
        .select('*, items:sale_items(*), payments:sale_payments(*)')
        .order('sale_date', { ascending: false });
      if (data) {
        return data.map((s: any) => ({
          ...s,
          payments: s.payments || []
        }));
      }
    }
    let local = this.getFromLocal<Sale[] | null>(STORAGE_KEYS.SALES, null);
    if (!local) {
      local = INITIAL_SEED_SALES;
      this.saveToLocal(STORAGE_KEYS.SALES, local);
    }
    return local.map(s => ({
      ...s,
      payments: s.payments || (s.amount_received > 0 ? [{
        id: `pay-${s.id}-legacy`,
        sale_id: s.id,
        payment_date: s.sale_date,
        amount: s.amount_received,
        payment_method: s.payment_method || 'Cash',
        notes: 'Initial recorded payment',
        created_at: s.created_at
      }] : [])
    }));
  }

  async createSale(
    saleData: {
      sale_date: string;
      invoice_number: string;
      customer_name: string;
      buyer_gstin?: string;
      buyer_address?: string;
      customer_phone?: string;
      is_interstate: boolean;
      payment_method?: string;
      payment_status?: PaymentStatus;
      amount_received: number;
      notes?: string;
    },
    itemsData: Array<{
      item_id: string;
      item_name: string;
      quantity: number;
      unit_sale_rate: number;
      gst_rate?: number;
    }>
  ): Promise<Sale> {
    if (!itemsData || itemsData.length === 0) {
      throw new Error('Invoice must contain at least one item.');
    }

    const allItems = await this.getItems();
    const itemMap = new Map(allItems.map(i => [i.id, i]));

    // Step 1: Validate stock
    for (const line of itemsData) {
      const item = itemMap.get(line.item_id);
      if (!item) throw new Error(`Item "${line.item_name}" not found in inventory.`);
      if (item.current_stock < line.quantity) {
        throw new Error(`Insufficient stock for "${item.name}". Available: ${item.current_stock}, Requested: ${line.quantity}.`);
      }
    }

    const saleId = `sale-${Date.now()}`;
    const now = new Date().toISOString();

    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalGst = 0;
    let totalCost = 0;

    const isInterstate = !!saleData.is_interstate;

    const saleLines: SaleItem[] = itemsData.map((line, idx) => {
      const item = itemMap.get(line.item_id)!;
      const gstRate = Number(line.gst_rate ?? 3.00);
      const lineTaxable = Math.round(line.quantity * line.unit_sale_rate * 100) / 100;

      let cgst = 0;
      let sgst = 0;
      let igst = 0;
      let lineGst = 0;

      if (isInterstate) {
        igst = Math.round((lineTaxable * (gstRate / 100)) * 100) / 100;
        lineGst = igst;
        totalIgst += igst;
      } else {
        cgst = Math.round((lineTaxable * (gstRate / 200)) * 100) / 100;
        sgst = Math.round((lineTaxable * (gstRate / 200)) * 100) / 100;
        lineGst = cgst + sgst;
        totalCgst += cgst;
        totalSgst += sgst;
      }

      const lineTotal = Math.round((lineTaxable + lineGst) * 100) / 100;
      const lineCost = Math.round(line.quantity * item.purchase_rate * 100) / 100;
      const lineProfit = Math.round((lineTaxable - lineCost) * 100) / 100;

      totalTaxable += lineTaxable;
      totalGst += lineGst;
      totalCost += lineCost;

      return {
        id: `sitem-${saleId}-${idx + 1}`,
        sale_id: saleId,
        item_id: item.id,
        item_name: item.name,
        quantity: line.quantity,
        unit_cost: item.purchase_rate,
        unit_sale_rate: line.unit_sale_rate,
        gst_rate: gstRate,
        taxable_amount: lineTaxable,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: igst,
        gst_amount: lineGst,
        line_total: lineTotal,
        line_cost: lineCost,
        line_profit: lineProfit
      };
    });

    const grandTotal = Math.round((totalTaxable + totalGst) * 100) / 100;
    const grossProfit = Math.round((totalTaxable - totalCost) * 100) / 100;

    const rawReceived = Number(saleData.amount_received) || 0;
    if (rawReceived < 0) {
      throw new Error('Payment received cannot be negative.');
    }
    if (rawReceived > grandTotal) {
      throw new Error(`Payment received (₹${rawReceived}) cannot exceed invoice total (₹${grandTotal}).`);
    }

    const amountReceived = Math.round(rawReceived * 100) / 100;
    const amountDue = Math.max(0, Math.round((grandTotal - amountReceived) * 100) / 100);

    let paymentStatus: PaymentStatus = 'Due Balance';
    if (amountDue === 0 && grandTotal > 0) {
      paymentStatus = 'Payment Complete';
    } else if (saleData.payment_status === 'Advance Paid' && amountReceived > 0) {
      paymentStatus = 'Advance Paid';
    } else if (saleData.payment_status === 'Payment Complete' && amountDue > 0) {
      throw new Error(`Cannot save as "Payment Complete" while an outstanding balance of ₹${amountDue} remains.`);
    } else {
      paymentStatus = 'Due Balance';
    }

    // Step 2: Deduct stock atomically
    for (const line of itemsData) {
      const item = itemMap.get(line.item_id)!;
      item.current_stock -= line.quantity;
      item.updated_at = now;
    }

    // Create initial payment record if amountReceived > 0
    const initialPayments: SalePayment[] = [];
    if (amountReceived > 0) {
      initialPayments.push({
        id: `pay-${saleId}-1`,
        sale_id: saleId,
        payment_date: saleData.sale_date,
        amount: amountReceived,
        payment_method: saleData.payment_method || 'Cash',
        notes: paymentStatus === 'Advance Paid' ? 'Advance Payment' : 'Initial Payment',
        created_at: now
      });
    }

    const newSale: Sale = {
      id: saleId,
      invoice_number: saleData.invoice_number,
      sale_date: saleData.sale_date,
      customer_name: saleData.customer_name.trim(),
      buyer_gstin: saleData.buyer_gstin?.trim() || undefined,
      buyer_address: saleData.buyer_address?.trim() || undefined,
      customer_phone: saleData.customer_phone?.trim() || undefined,
      is_interstate: isInterstate,
      payment_method: saleData.payment_method || 'Cash',
      payment_status: paymentStatus,
      total_taxable: totalTaxable,
      total_cgst: totalCgst,
      total_sgst: totalSgst,
      total_igst: totalIgst,
      total_gst: totalGst,
      grand_total: grandTotal,
      total_cost: totalCost,
      gross_profit: grossProfit,
      amount_received: amountReceived,
      amount_due: amountDue,
      notes: saleData.notes?.trim() || undefined,
      status: 'completed',
      created_at: now,
      updated_at: now,
      items: saleLines,
      payments: initialPayments
    };

    // Save updated items & sales
    this.saveToLocal(STORAGE_KEYS.ITEMS, allItems);
    const sales = await this.getSales();
    sales.unshift(newSale);
    this.saveToLocal(STORAGE_KEYS.SALES, sales);

    // Increment next invoice number
    const settings = await this.getSettings();
    await this.updateSettings({ next_invoice_number: settings.next_invoice_number + 1 });

    const client = getSupabaseClient();
    if (client) {
      await client.from('sales').insert(newSale);
      await client.from('sale_items').insert(saleLines);
      if (initialPayments.length > 0) {
        await client.from('sale_payments').insert(initialPayments);
      }
      await client.from('items').upsert(allItems);
    }

    return newSale;
  }

  async recordSalePayment(
    saleId: string,
    amount: number,
    paymentMethod: string = 'Cash',
    paymentDate?: string,
    notes?: string
  ): Promise<Sale> {
    const rawAmount = Number(amount);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const sales = await this.getSales();
    const saleIndex = sales.findIndex(s => s.id === saleId);
    if (saleIndex === -1) throw new Error('Sale invoice not found.');

    const sale = sales[saleIndex];
    if (sale.status === 'voided') {
      throw new Error('Cannot add payment to a voided invoice.');
    }

    const currentDue = sale.amount_due !== undefined ? sale.amount_due : Math.max(0, sale.grand_total - (sale.amount_received || 0));
    if (currentDue <= 0) {
      throw new Error('This invoice is already fully paid.');
    }

    if (rawAmount > currentDue + 0.01) {
      throw new Error(`Payment amount (₹${rawAmount}) cannot exceed outstanding due balance (₹${currentDue}).`);
    }

    const now = new Date().toISOString();
    const appliedAmount = Math.min(rawAmount, currentDue);

    const paymentRecord: SalePayment = {
      id: `pay-${saleId}-${(sale.payments?.length || 0) + 1}-${Date.now()}`,
      sale_id: saleId,
      payment_date: paymentDate ? new Date(paymentDate).toISOString() : now,
      amount: appliedAmount,
      payment_method: paymentMethod || 'Cash',
      notes: notes?.trim() || undefined,
      created_at: now
    };

    const existingPayments = sale.payments || [];
    const updatedPayments = [...existingPayments, paymentRecord];
    const totalReceived = Math.round(updatedPayments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;
    const newDue = Math.max(0, Math.round((sale.grand_total - totalReceived) * 100) / 100);

    let newStatus: PaymentStatus = 'Due Balance';
    if (newDue <= 0.001) {
      newStatus = 'Payment Complete';
    } else {
      newStatus = 'Due Balance';
    }

    const updatedSale: Sale = {
      ...sale,
      payments: updatedPayments,
      amount_received: totalReceived,
      amount_due: newDue,
      payment_status: newStatus,
      updated_at: now
    };

    sales[saleIndex] = updatedSale;
    this.saveToLocal(STORAGE_KEYS.SALES, sales);

    const client = getSupabaseClient();
    if (client) {
      await client.from('sale_payments').insert(paymentRecord);
      await client.from('sales').update({
        amount_received: totalReceived,
        amount_due: newDue,
        payment_status: newStatus,
        updated_at: now
      }).eq('id', saleId);
    }

    return updatedSale;
  }

  async voidSale(saleId: string, reason: string): Promise<void> {
    const sales = await this.getSales();
    const saleIndex = sales.findIndex(s => s.id === saleId);
    if (saleIndex === -1) throw new Error('Sale not found');

    const sale = sales[saleIndex];
    if (sale.status === 'voided') throw new Error('Sale is already voided');

    const items = await this.getItems();
    const itemMap = new Map(items.map(i => [i.id, i]));
    const now = new Date().toISOString();

    // Restore stock
    if (sale.items) {
      for (const line of sale.items) {
        if (line.item_id && itemMap.has(line.item_id)) {
          const item = itemMap.get(line.item_id)!;
          item.current_stock += line.quantity;
          item.updated_at = now;
        }
      }
      this.saveToLocal(STORAGE_KEYS.ITEMS, items);
    }

    sale.status = 'voided';
    sale.void_reason = reason;
    sale.updated_at = now;
    sales[saleIndex] = sale;
    this.saveToLocal(STORAGE_KEYS.SALES, sales);

    const client = getSupabaseClient();
    if (client) {
      await client.from('sales').update({ status: 'voided', void_reason: reason, updated_at: now }).eq('id', saleId);
      await client.from('items').upsert(items);
    }
  }

  // --- OPERATING EXPENSES ---
  async getExpenses(): Promise<Expense[]> {
    const client = getSupabaseClient();
    if (client) {
      const { data } = await client.from('expenses').select('*').order('expense_date', { ascending: false });
      if (data) return data;
    }
    let local = this.getFromLocal<Expense[] | null>(STORAGE_KEYS.EXPENSES, null);
    if (!local) {
      local = INITIAL_SEED_EXPENSES;
      this.saveToLocal(STORAGE_KEYS.EXPENSES, local);
    }
    return local;
  }

  async saveExpense(expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Expense> {
    const now = new Date().toISOString();
    const id = expenseData.id || `exp-${Date.now()}`;

    const expenseRecord: Expense = {
      id,
      expense_date: expenseData.expense_date,
      title: expenseData.title.trim(),
      category: expenseData.category || 'Other',
      amount: Number(expenseData.amount) || 0,
      payment_method: expenseData.payment_method || 'Cash',
      payment_status: expenseData.payment_status || 'Paid',
      notes: expenseData.notes || '',
      is_cancelled: expenseData.is_cancelled || false,
      created_at: now,
      updated_at: now
    };

    const expenses = await this.getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index >= 0) expenses[index] = { ...expenses[index], ...expenseRecord, updated_at: now };
    else expenses.unshift(expenseRecord);
    this.saveToLocal(STORAGE_KEYS.EXPENSES, expenses);

    const client = getSupabaseClient();
    if (client) await client.from('expenses').upsert(expenseRecord);

    return expenseRecord;
  }

  async deleteExpense(id: string): Promise<void> {
    const expenses = await this.getExpenses();
    this.saveToLocal(STORAGE_KEYS.EXPENSES, expenses.filter(e => e.id !== id));
    const client = getSupabaseClient();
    if (client) await client.from('expenses').delete().eq('id', id);
  }

  // --- PERIOD-BASED INVENTORY MOVEMENT (OPENING + IN - OUT = CLOSING) ---
  async getStockMovementPeriod(startDate: Date, endDate: Date): Promise<StockMovementPeriod[]> {
    const items = await this.getItems();
    const purchases = await this.getPurchases();
    const sales = await this.getSales();

    return items.map(item => {
      let purchasedInPeriod = 0;
      let soldInPeriod = 0;

      purchases.forEach(p => {
        if (p.status !== 'active') return;
        const pDate = new Date(p.purchase_date);
        if (pDate >= startDate && pDate <= endDate) {
          p.items?.forEach(line => {
            if (line.item_id === item.id || line.item_name.toLowerCase() === item.name.toLowerCase()) {
              purchasedInPeriod += line.quantity;
            }
          });
        }
      });

      sales.forEach(s => {
        if (s.status !== 'completed') return;
        const sDate = new Date(s.sale_date);
        if (sDate >= startDate && sDate <= endDate) {
          s.items?.forEach(line => {
            if (line.item_id === item.id || line.item_name.toLowerCase() === item.name.toLowerCase()) {
              soldInPeriod += line.quantity;
            }
          });
        }
      });

      const openingStock = item.opening_stock || 0;
      const currentStock = item.current_stock;
      const stockValuation = currentStock * item.purchase_rate;

      return {
        item_id: item.id,
        item_name: item.name,
        category: item.category,
        opening_stock: openingStock,
        purchased_qty: purchasedInPeriod,
        sold_qty: soldInPeriod,
        current_stock: currentStock,
        purchase_rate: item.purchase_rate,
        default_sale_rate: item.default_sale_rate,
        stock_value: stockValuation
      };
    });
  }

  // --- BACKUP & RESTORE ---
  async restoreFromBackup(payload: any): Promise<{ success: boolean; message: string }> {
    if (payload.business_settings) await this.updateSettings(payload.business_settings);
    if (Array.isArray(payload.items)) this.saveToLocal(STORAGE_KEYS.ITEMS, payload.items);
    if (Array.isArray(payload.purchases)) this.saveToLocal(STORAGE_KEYS.PURCHASES, payload.purchases);
    if (Array.isArray(payload.sales)) this.saveToLocal(STORAGE_KEYS.SALES, payload.sales);
    if (Array.isArray(payload.expenses)) this.saveToLocal(STORAGE_KEYS.EXPENSES, payload.expenses);

    return {
      success: true,
      message: `Successfully restored ${payload.items?.length || 0} items, ${payload.purchases?.length || 0} purchases, ${payload.sales?.length || 0} sales, and ${payload.expenses?.length || 0} expenses.`
    };
  }
}

export const storage = new StorageService();
