/**
 * Currency Utilities
 * Comprehensive list of supported currencies with symbols and formatting
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    symbolPosition: 'before',
    decimalPlaces: 0
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  CHF: {
    code: 'CHF',
    symbol: 'Fr',
    name: 'Swiss Franc',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  HKD: {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  MXN: {
    code: 'MXN',
    symbol: 'Mex$',
    name: 'Mexican Peso',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    symbolPosition: 'before',
    decimalPlaces: 2
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    symbolPosition: 'before',
    decimalPlaces: 2
  }
};

/**
 * Get currency symbol from currency code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol || '$';
};

/**
 * Get currency info from currency code
 */
export const getCurrencyInfo = (currencyCode: string): CurrencyInfo => {
  return SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES['USD'];
};

/**
 * Format amount with currency
 */
export const formatCurrencyAmount = (amount: number, currencyCode: string): string => {
  const info = getCurrencyInfo(currencyCode);
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: info.decimalPlaces,
    maximumFractionDigits: info.decimalPlaces
  });

  if (info.symbolPosition === 'before') {
    return `${info.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount}${info.symbol}`;
  }
};

/**
 * Get list of all supported currency codes
 */
export const getSupportedCurrencyCodes = (): string[] => {
  return Object.keys(SUPPORTED_CURRENCIES);
};

/**
 * Get list of all currencies with names for dropdowns
 */
export const getCurrencyOptions = () => {
  return Object.values(SUPPORTED_CURRENCIES).map(currency => ({
    value: currency.code,
    label: `${currency.code} - ${currency.name} (${currency.symbol})`
  }));
};
