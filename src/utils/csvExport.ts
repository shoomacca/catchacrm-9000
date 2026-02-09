/**
 * CSV Export Utility
 * Exports array of objects to CSV file download
 */

type ExportableValue = string | number | boolean | null | undefined | Date;

interface ExportConfig {
  filename: string;
  columns?: { key: string; header: string; formatter?: (value: any, row: any) => string }[];
}

/**
 * Escapes a value for CSV format
 */
const escapeCSV = (value: ExportableValue): string => {
  if (value === null || value === undefined) return '';

  const str = value instanceof Date
    ? value.toISOString()
    : String(value);

  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Exports data to CSV and triggers download
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  config: ExportConfig
): void => {
  if (!data.length) {
    console.warn('No data to export');
    return;
  }

  let headers: string[];
  let rows: string[][];

  if (config.columns) {
    // Use specified columns
    headers = config.columns.map(c => c.header);
    rows = data.map(row =>
      config.columns!.map(col => {
        const value = row[col.key];
        if (col.formatter) {
          return escapeCSV(col.formatter(value, row));
        }
        return escapeCSV(value);
      })
    );
  } else {
    // Auto-detect columns from first row
    headers = Object.keys(data[0]).filter(key =>
      !key.startsWith('_') &&
      typeof data[0][key] !== 'function' &&
      typeof data[0][key] !== 'object'
    );
    rows = data.map(row =>
      headers.map(key => escapeCSV(row[key]))
    );
  }

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${config.filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Pre-configured export functions for common entities
 */
export const exportLeads = (leads: any[]) => {
  exportToCSV(leads, {
    filename: 'leads_export',
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'company', header: 'Company' },
      { key: 'status', header: 'Status' },
      { key: 'source', header: 'Source' },
      { key: 'estimatedValue', header: 'Est. Value', formatter: (v) => v ? `$${v}` : '' },
      { key: 'score', header: 'Score' },
      { key: 'createdAt', header: 'Created', formatter: (v) => v ? new Date(v).toLocaleDateString() : '' },
    ]
  });
};

export const exportDeals = (deals: any[]) => {
  exportToCSV(deals, {
    filename: 'deals_export',
    columns: [
      { key: 'name', header: 'Deal Name' },
      { key: 'stage', header: 'Stage' },
      { key: 'amount', header: 'Amount', formatter: (v) => v ? `$${v}` : '' },
      { key: 'probability', header: 'Probability', formatter: (v) => v ? `${(v * 100).toFixed(0)}%` : '' },
      { key: 'closeDate', header: 'Close Date', formatter: (v) => v ? new Date(v).toLocaleDateString() : '' },
      { key: 'createdAt', header: 'Created', formatter: (v) => v ? new Date(v).toLocaleDateString() : '' },
    ]
  });
};

export const exportAccounts = (accounts: any[]) => {
  exportToCSV(accounts, {
    filename: 'accounts_export',
    columns: [
      { key: 'name', header: 'Account Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'website', header: 'Website' },
      { key: 'industry', header: 'Industry' },
      { key: 'tier', header: 'Tier' },
      { key: 'annualRevenue', header: 'Annual Revenue', formatter: (v) => v ? `$${v}` : '' },
      { key: 'createdAt', header: 'Created', formatter: (v) => v ? new Date(v).toLocaleDateString() : '' },
    ]
  });
};

export const exportContacts = (contacts: any[]) => {
  exportToCSV(contacts, {
    filename: 'contacts_export',
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'company', header: 'Company' },
      { key: 'title', header: 'Title' },
      { key: 'isPrimary', header: 'Primary Contact', formatter: (v) => v ? 'Yes' : 'No' },
      { key: 'createdAt', header: 'Created', formatter: (v) => v ? new Date(v).toLocaleDateString() : '' },
    ]
  });
};

export const exportInvoices = (invoices: any[]) => {
  exportToCSV(invoices, {
    filename: 'invoices_export',
    columns: [
      { key: 'invoiceNumber', header: 'Invoice #' },
      { key: 'status', header: 'Status' },
      { key: 'total', header: 'Total', formatter: (v) => v ? `$${v.toLocaleString()}` : '' },
      { key: 'dueDate', header: 'Due Date', formatter: (v) => v ? new Date(v).toLocaleDateString() : '' },
      { key: 'paidAt', header: 'Paid Date', formatter: (v) => v ? new Date(v).toLocaleDateString() : '' },
      { key: 'createdAt', header: 'Created', formatter: (v) => v ? new Date(v).toLocaleDateString() : '' },
    ]
  });
};

export const exportJobs = (jobs: any[]) => {
  exportToCSV(jobs, {
    filename: 'jobs_export',
    columns: [
      { key: 'jobNumber', header: 'Job #' },
      { key: 'name', header: 'Job Name' },
      { key: 'jobType', header: 'Type' },
      { key: 'status', header: 'Status' },
      { key: 'priority', header: 'Priority' },
      { key: 'zone', header: 'Zone' },
      { key: 'scheduledDate', header: 'Scheduled', formatter: (v) => v ? new Date(v).toLocaleDateString() : '' },
      { key: 'completedAt', header: 'Completed', formatter: (v) => v ? new Date(v).toLocaleDateString() : '' },
    ]
  });
};

export const exportCampaigns = (campaigns: any[]) => {
  exportToCSV(campaigns, {
    filename: 'campaigns_export',
    columns: [
      { key: 'name', header: 'Campaign Name' },
      { key: 'type', header: 'Type' },
      { key: 'status', header: 'Status' },
      { key: 'budget', header: 'Budget', formatter: (v) => v ? `$${v.toLocaleString()}` : '' },
      { key: 'spend', header: 'Spend', formatter: (v) => v ? `$${v.toLocaleString()}` : '' },
      { key: 'revenue', header: 'Revenue', formatter: (v) => v ? `$${v.toLocaleString()}` : '' },
      { key: 'startDate', header: 'Start Date', formatter: (v) => v ? new Date(v).toLocaleDateString() : '' },
      { key: 'endDate', header: 'End Date', formatter: (v) => v ? new Date(v).toLocaleDateString() : '' },
    ]
  });
};

/**
 * CSV Import Utility
 * Parses CSV file and returns array of objects
 */

interface ImportConfig {
  columnMapping?: Record<string, string>; // CSV header -> object key mapping
  parser?: Record<string, (value: string) => any>; // Custom parsers for specific fields
  skipEmptyRows?: boolean;
}

interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
  skipped: number;
}

/**
 * Parses CSV text content
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Push last field
  result.push(current.trim());

  return result;
};

/**
 * Imports CSV file and returns parsed data
 */
export const importFromCSV = <T extends Record<string, any>>(
  csvContent: string,
  config: ImportConfig = {}
): ImportResult<T> => {
  const {
    columnMapping = {},
    parser = {},
    skipEmptyRows = true
  } = config;

  const errors: string[] = [];
  const data: T[] = [];
  let skipped = 0;

  try {
    const lines = csvContent.split('\n').map(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    // Parse header
    const headers = parseCSVLine(lines[0]);
    const mappedHeaders = headers.map(h => columnMapping[h] || h.toLowerCase().replace(/\s+/g, '_'));

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line && skipEmptyRows) {
        skipped++;
        continue;
      }

      try {
        const values = parseCSVLine(line);
        const row: any = {};

        mappedHeaders.forEach((header, index) => {
          let value: any = values[index] || '';

          // Apply custom parser if available
          if (parser[header]) {
            try {
              value = parser[header](value);
            } catch (parseError) {
              errors.push(`Row ${i + 1}, column "${header}": Parse error - ${parseError}`);
              value = values[index]; // Keep original value on parse error
            }
          } else {
            // Auto-detect and parse numbers
            if (value && !isNaN(Number(value)) && value.trim() !== '') {
              value = Number(value);
            }
            // Auto-detect booleans
            if (value === 'true') value = true;
            if (value === 'false') value = false;
          }

          row[header] = value;
        });

        data.push(row as T);
      } catch (rowError) {
        errors.push(`Row ${i + 1}: ${rowError}`);
      }
    }

    return {
      success: errors.length === 0,
      data,
      errors,
      skipped
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [String(error)],
      skipped: 0
    };
  }
};

/**
 * Triggers file picker for CSV import
 */
export const triggerCSVImport = <T extends Record<string, any>>(
  config: ImportConfig,
  onImport: (result: ImportResult<T>) => void
): void => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,text/csv';

  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvContent = event.target?.result as string;
      const result = importFromCSV<T>(csvContent, config);
      onImport(result);
    };
    reader.readAsText(file);
  };

  input.click();
};
