/**
 * CSV Parsing and Generation Engine for Bank Statements & Expenses
 */

export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export interface ExpenseImportRow {
  date: string;
  amount: number;
  note: string;
  categoryName?: string;
  paymentMethod: 'upi' | 'credit_card' | 'debit_card' | 'net_banking' | 'cash' | 'other';
  isValid: boolean;
  validationError?: string;
  rawRow: Record<string, string>;
}

export interface ColumnMapping {
  dateCol: string;
  amountCol: string;
  noteCol: string;
  categoryCol?: string;
  paymentMethodCol?: string;
}

/**
 * Parse raw CSV text string into headers and row objects
 */
export function parseCsvText(csvText: string): ParsedCsvResult {
  if (!csvText || !csvText.trim()) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  // Normalize line endings
  const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  // Detect delimiter (comma, semicolon, tab)
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

  // Parse CSV Line respecting double quotes
  const parseLine = (text: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map((h, i) => (h && h.trim()) ? h.trim().replace(/^["']|["']$/g, '') : `Column_${i + 1}`);

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rowValues = parseLine(lines[i]);
    if (rowValues.length === 0 || rowValues.every(val => val === '')) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      rowObj[header] = (rowValues[idx] || '').replace(/^["']|["']$/g, '').trim();
    });
    rows.push(rowObj);
  }

  return {
    headers,
    rows,
    totalRows: rows.length,
  };
}

/**
 * Automatically guess column mappings based on common bank statement headers
 */
export function autoDetectColumnMapping(headers: string[]): ColumnMapping {
  const normalize = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

  let dateCol = headers[0] || '';
  let amountCol = headers[1] || '';
  let noteCol = headers[2] || '';
  let categoryCol = '';
  let paymentMethodCol = '';

  const dateKeywords = ['date', 'txn_date', 'transactiondate', 'valuedate', 'postdate', 'spendingdate'];
  const amountKeywords = ['amount', 'debit', 'withdraw', 'spent', 'transactionamount', 'inr', 'usd', 'total'];
  const noteKeywords = ['description', 'particulars', 'narration', 'merchant', 'payee', 'note', 'details', 'remarks', 'title'];
  const categoryKeywords = ['category', 'type', 'tag', 'group', 'expensecategory'];
  const paymentKeywords = ['paymentmode', 'paymentmethod', 'mode', 'channel', 'method'];

  headers.forEach((h) => {
    const norm = normalize(h);
    if (!dateCol || dateKeywords.some(k => norm.includes(k))) {
      if (dateKeywords.some(k => norm.includes(k))) dateCol = h;
    }
    if (amountKeywords.some(k => norm.includes(k))) {
      amountCol = h;
    }
    if (noteKeywords.some(k => norm.includes(k))) {
      noteCol = h;
    }
    if (categoryKeywords.some(k => norm.includes(k))) {
      categoryCol = h;
    }
    if (paymentKeywords.some(k => norm.includes(k))) {
      paymentMethodCol = h;
    }
  });

  return {
    dateCol,
    amountCol,
    noteCol,
    categoryCol,
    paymentMethodCol,
  };
}

/**
 * Standardize varied date strings into ISO format (YYYY-MM-DD)
 */
export function parseDateString(dateStr: string): string | null {
  if (!dateStr || !dateStr.trim()) return null;
  const clean = dateStr.trim();

  // If already standard ISO
  const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const [_, y, m, d] = isoMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const [_, d, m, y] = dmyMatch;
    // Check if month <= 12
    if (Number(m) <= 12) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }

  // MM/DD/YYYY
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

/**
 * Clean and parse numeric amount from strings with currency symbols or commas
 */
export function parseAmount(amountStr: string): number {
  if (!amountStr) return 0;
  // Remove currency signs, commas, spaces, quotes
  const clean = amountStr.replace(/[^0-9.-]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  // Expense amounts should be positive
  return Math.abs(num);
}

/**
 * Transform parsed CSV rows into typed ExpenseImportRow with validation
 */
export function processImportRows(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): ExpenseImportRow[] {
  return rows.map((row) => {
    const rawDate = row[mapping.dateCol] || '';
    const rawAmount = row[mapping.amountCol] || '';
    const rawNote = row[mapping.noteCol] || 'Bank Transaction';
    const rawCategory = mapping.categoryCol ? row[mapping.categoryCol] : '';
    const rawPayment = mapping.paymentMethodCol ? row[mapping.paymentMethodCol] : '';

    const parsedDate = parseDateString(rawDate);
    const amount = parseAmount(rawAmount);

    let isValid = true;
    let validationError = '';

    if (!parsedDate) {
      isValid = false;
      validationError = `Invalid date format: "${rawDate}"`;
    } else if (amount <= 0) {
      isValid = false;
      validationError = `Amount must be greater than 0: "${rawAmount}"`;
    }

    // Guess payment mode
    let paymentMethod: 'upi' | 'credit_card' | 'debit_card' | 'net_banking' | 'cash' | 'other' = 'upi';
    const pLower = (rawPayment + ' ' + rawNote).toLowerCase();
    if (pLower.includes('card') || pLower.includes('pos') || pLower.includes('visa') || pLower.includes('mastercard')) {
      paymentMethod = 'credit_card';
    } else if (pLower.includes('atm') || pLower.includes('debit')) {
      paymentMethod = 'debit_card';
    } else if (pLower.includes('netbanking') || pLower.includes('neft') || pLower.includes('rtgs') || pLower.includes('imps') || pLower.includes('ach')) {
      paymentMethod = 'net_banking';
    } else if (pLower.includes('cash')) {
      paymentMethod = 'cash';
    } else if (pLower.includes('upi') || pLower.includes('gpay') || pLower.includes('phonepe') || pLower.includes('paytm')) {
      paymentMethod = 'upi';
    }

    return {
      date: parsedDate || new Date().toISOString().slice(0, 10),
      amount,
      note: rawNote,
      categoryName: rawCategory || undefined,
      paymentMethod,
      isValid,
      validationError,
      rawRow: row,
    };
  });
}
