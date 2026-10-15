import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Item, Purchase, Sale, Expense, BusinessSettings, WholesaleDashboardStats, StockMovementPeriod } from '../types';
import { storage } from '../lib/storage';

interface AppDataContextType {
  items: Item[];
  purchases: Purchase[];
  sales: Sale[];
  expenses: Expense[];
  settings: BusinessSettings;
  loading: boolean;
  isOnline: boolean;
  stats: WholesaleDashboardStats;
  refreshData: () => Promise<void>;
  createPurchase: (purchaseData: any, itemsData: any[]) => Promise<Purchase>;
  deletePurchase: (purchaseId: string) => Promise<void>;
  createSale: (saleData: any, itemsData: any[]) => Promise<Sale>;
  recordSalePayment: (saleId: string, amount: number, paymentMethod?: string, paymentDate?: string, notes?: string) => Promise<Sale>;
  voidSale: (saleId: string, reason: string) => Promise<void>;
  saveItem: (item: any) => Promise<Item>;
  adjustStock: (itemId: string, quantityChange: number, reason: string) => Promise<Item>;
  archiveOrDeleteItem: (itemId: string, action: 'archive' | 'unarchive' | 'delete') => Promise<void>;
  saveExpense: (expense: any) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<BusinessSettings>;
  restoreBackup: (payload: any) => Promise<{ success: boolean; message: string }>;
  getStockMovementPeriod: (startDate: Date, endDate: Date) => Promise<StockMovementPeriod[]>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>({} as BusinessSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedSettings, fetchedItems, fetchedPurchases, fetchedSales, fetchedExpenses] = await Promise.all([
        storage.getSettings(),
        storage.getItems(),
        storage.getPurchases(),
        storage.getSales(),
        storage.getExpenses()
      ]);
      setSettings(fetchedSettings);
      setItems(fetchedItems);
      setPurchases(fetchedPurchases);
      setSales(fetchedSales);
      setExpenses(fetchedExpenses);
    } catch (e) {
      console.error('Failed to load application data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Compute 6 Essential Wholesale Cards for the Dashboard
  const stats: WholesaleDashboardStats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    let monthSales = 0;
    let monthIncome = 0; // Taxable sales revenue excluding GST
    let monthCogs = 0;

    sales.forEach(s => {
      if (s.status !== 'completed') return;
      const sDate = new Date(s.sale_date);
      if (sDate >= currentMonthStart && sDate <= now) {
        monthSales += s.grand_total;
        monthIncome += s.total_taxable;
        monthCogs += s.total_cost;
      }
    });

    let monthPurchases = 0;
    purchases.forEach(p => {
      if (p.status !== 'active') return;
      const pDate = new Date(p.purchase_date);
      if (pDate >= currentMonthStart && pDate <= now) {
        monthPurchases += p.grand_total;
      }
    });

    let monthExpenses = 0;
    expenses.forEach(e => {
      if (e.is_cancelled) return;
      const eDate = new Date(e.expense_date);
      if (eDate >= currentMonthStart && eDate <= now) {
        monthExpenses += e.amount;
      }
    });

    // Expenditure = COGS (cost of inventory actually sold) + Operating Expenses
    const monthExpenditure = monthCogs + monthExpenses;
    const monthNetResult = monthIncome - monthExpenditure;

    const activeItems = items.filter(i => !i.is_archived);
    const stockUnits = activeItems.reduce((sum, i) => sum + i.current_stock, 0);
    const stockValue = activeItems.reduce((sum, i) => sum + (i.current_stock * i.purchase_rate), 0);

    return {
      month_sales: monthSales,
      month_purchases: monthPurchases,
      current_stock_units: stockUnits,
      current_stock_value: stockValue,
      month_income: monthIncome,
      month_expenditure: monthExpenditure,
      month_net_result: monthNetResult
    };
  }, [sales, purchases, items, expenses]);

  const createPurchase = async (purchaseData: any, itemsData: any[]) => {
    const created = await storage.createPurchase(purchaseData, itemsData);
    await refreshData();
    return created;
  };

  const deletePurchase = async (purchaseId: string) => {
    await storage.deletePurchase(purchaseId);
    await refreshData();
  };

  const createSale = async (saleData: any, itemsData: any[]) => {
    const created = await storage.createSale(saleData, itemsData);
    await refreshData();
    return created;
  };

  const recordSalePayment = async (
    saleId: string,
    amount: number,
    paymentMethod?: string,
    paymentDate?: string,
    notes?: string
  ) => {
    const updated = await storage.recordSalePayment(saleId, amount, paymentMethod, paymentDate, notes);
    await refreshData();
    return updated;
  };

  const voidSale = async (saleId: string, reason: string) => {
    await storage.voidSale(saleId, reason);
    await refreshData();
  };

  const saveItem = async (itemData: any) => {
    const saved = await storage.saveItem(itemData);
    await refreshData();
    return saved;
  };

  const adjustStock = async (itemId: string, quantityChange: number, reason: string) => {
    const updated = await storage.adjustStock(itemId, quantityChange, reason);
    await refreshData();
    return updated;
  };

  const archiveOrDeleteItem = async (itemId: string, action: 'archive' | 'unarchive' | 'delete') => {
    await storage.archiveOrDeleteItem(itemId, action);
    await refreshData();
  };

  const saveExpense = async (expenseData: any) => {
    const saved = await storage.saveExpense(expenseData);
    await refreshData();
    return saved;
  };

  const deleteExpense = async (id: string) => {
    await storage.deleteExpense(id);
    await refreshData();
  };

  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    const updated = await storage.updateSettings(newSettings);
    setSettings(updated);
    return updated;
  };

  const restoreBackup = async (payload: any) => {
    const res = await storage.restoreFromBackup(payload);
    await refreshData();
    return res;
  };

  const getStockMovementPeriod = async (startDate: Date, endDate: Date) => {
    return await storage.getStockMovementPeriod(startDate, endDate);
  };

  return (
    <AppDataContext.Provider
      value={{
        items,
        purchases,
        sales,
        expenses,
        settings,
        loading,
        isOnline,
        stats,
        refreshData,
        createPurchase,
        deletePurchase,
        createSale,
        recordSalePayment,
        voidSale,
        saveItem,
        adjustStock,
        archiveOrDeleteItem,
        saveExpense,
        deleteExpense,
        updateSettings,
        restoreBackup,
        getStockMovementPeriod
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
