/**
 * Date/Time Formatting Utility
 * Uses Control Plane settings for localization
 */

import { CRMSettings } from '../types';

/**
 * Format a date string according to the user's configured date format
 */
export const formatDate = (dateString: string | Date, settings: CRMSettings): string => {
  if (!dateString) return '';

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  switch (settings.localization.dateFormat) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
    default:
      return `${month}/${day}/${year}`;
  }
};

/**
 * Format a time string according to the user's configured time format
 */
export const formatTime = (dateString: string | Date, settings: CRMSettings): string => {
  if (!dateString) return '';

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (settings.localization.timeFormat === '24h') {
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  } else {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${period}`;
  }
};

/**
 * Format date and time together
 */
export const formatDateTime = (dateString: string | Date, settings: CRMSettings): string => {
  return `${formatDate(dateString, settings)} ${formatTime(dateString, settings)}`;
};

/**
 * Format currency according to user's currency symbol
 */
export const formatCurrency = (amount: number, settings: CRMSettings): string => {
  if (amount === null || amount === undefined) return `${settings.localization.currencySymbol}0.00`;
  return `${settings.localization.currencySymbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (dateString: string | Date): string => {
  if (!dateString) return '';

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

/**
 * Calculate tax amount based on Tax Engine settings
 */
export const calculateTax = (subtotal: number, settings: CRMSettings, taxRateId?: string): number => {
  if (!subtotal || subtotal === 0) return 0;

  // Find the tax rate to apply
  let taxRate = 0;
  if (taxRateId) {
    // Use specified tax rate
    const rate = settings.taxEngine?.find(t => t.id === taxRateId);
    if (rate) taxRate = rate.rate;
  } else {
    // Use default tax rate
    const defaultRate = settings.taxEngine?.find(t => t.isDefault);
    if (defaultRate) {
      taxRate = defaultRate.rate;
    } else if (settings.localization?.taxRate) {
      // Fallback to global tax rate
      taxRate = settings.localization.taxRate;
    }
  }

  return Math.round(subtotal * (taxRate / 100) * 100) / 100; // Round to 2 decimals
};

/**
 * Calculate invoice/quote totals with tax
 */
export interface LineItemTotals {
  subtotal: number;
  taxTotal: number;
  total: number;
}

export const calculateLineItemTotals = (
  lineItems: Array<{ qty: number; unitPrice: number }>,
  settings: CRMSettings,
  taxRateId?: string
): LineItemTotals => {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  const taxTotal = calculateTax(subtotal, settings, taxRateId);
  const total = subtotal + taxTotal;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};
