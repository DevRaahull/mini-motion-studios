// Export and Backup utility functions for SEVEN STAR JWELS

export const downloadBlob = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escapeCell = (cell: string | number | undefined | null) => {
    if (cell === undefined || cell === null) return '""';
    const str = String(cell);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ].join('\r\n');

  downloadBlob(csvContent, filename.endsWith('.csv') ? filename : `${filename}.csv`, 'text/csv;charset=utf-8;');
};

export interface BackupPayload {
  version: string;
  app_name: string;
  exported_at: string;
  business_settings: any;
  items: any[];
  purchases?: any[];
  purchase_items?: any[];
  sales: any[];
  sale_items: any[];
  inventory_movements: any[];
  expenses: any[];
}

export const generateBackupJson = (
  settings: any,
  items: any[],
  purchases: any[],
  sales: any[],
  saleItems: any[],
  movements: any[],
  expenses: any[]
): string => {
  const backup: BackupPayload = {
    version: '1.0.0',
    app_name: 'SEVEN STAR JWELS',
    exported_at: new Date().toISOString(),
    business_settings: settings,
    items: items || [],
    purchases: purchases || [],
    purchase_items: [],
    sales: sales || [],
    sale_items: saleItems || [],
    inventory_movements: movements || [],
    expenses: expenses || []
  };

  return JSON.stringify(backup, null, 2);
};

export interface BackupValidationResult {
  isValid: boolean;
  error?: string;
  summary?: {
    itemsCount: number;
    purchasesCount: number;
    salesCount: number;
    saleItemsCount: number;
    movementsCount: number;
    expensesCount: number;
    exportedAt: string;
    appName: string;
  };
  parsedData?: BackupPayload;
}

export const validateBackupFile = (jsonString: string): BackupValidationResult => {
  try {
    const data = JSON.parse(jsonString);

    if (!data || typeof data !== 'object') {
      return { isValid: false, error: 'Uploaded file is not a valid JSON object.' };
    }

    if (!Array.isArray(data.items)) {
      return { isValid: false, error: 'Backup is missing required "items" array.' };
    }

    if (!Array.isArray(data.sales)) {
      return { isValid: false, error: 'Backup is missing required "sales" array.' };
    }

    if (!Array.isArray(data.expenses)) {
      return { isValid: false, error: 'Backup is missing required "expenses" array.' };
    }

    return {
      isValid: true,
      summary: {
        itemsCount: data.items.length,
        purchasesCount: Array.isArray(data.purchases) ? data.purchases.length : 0,
        salesCount: data.sales.length,
        saleItemsCount: Array.isArray(data.sale_items) ? data.sale_items.length : 0,
        movementsCount: Array.isArray(data.inventory_movements) ? data.inventory_movements.length : 0,
        expensesCount: data.expenses.length,
        exportedAt: data.exported_at || 'Unknown',
        appName: data.app_name || 'SEVEN STAR JWELS'
      },
      parsedData: data as BackupPayload
    };
  } catch (err: any) {
    return { isValid: false, error: `JSON Parse Error: ${err.message || 'Corrupted file'}` };
  }
};
