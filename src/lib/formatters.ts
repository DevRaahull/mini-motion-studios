// Formatter utilities for SEVEN STAR JWELS (Midnight Ledger)

export const formatCurrency = (amount: number | undefined | null, symbol: string = '₹'): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${symbol} 0.00`;
  }
  // Standard Indian number format (lakhs & crores)
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const parts = absAmount.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian currency formatting: last 3 digits, then groups of 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${isNegative ? '-' : ''}${symbol} ${formattedInteger}.${decimalPart}`;
};

export const formatDate = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
};

export const formatDateTime = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '—';
  }
};

export const getDayOfWeek = (dateInput: string | Date = new Date()): string => {
  try {
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  } catch {
    return '';
  }
};

export const formatPercent = (val: number): string => {
  if (isNaN(val)) return '0%';
  const prefix = val > 0 ? '↑ ' : val < 0 ? '↓ ' : '— ';
  return `${prefix}${Math.abs(Math.round(val))}%`;
};
