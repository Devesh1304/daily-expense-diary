export type Direction = 'credit' | 'debit';
export type LedgerCategory = 'customer' | 'supplier' | 'bank' | 'other';
export type DateFilter = 'today' | 'week' | 'month' | 'custom';

export interface LedgerAccount {
  id: string;
  userId: string;
  name: string;
  category: LedgerCategory;
  createdAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  direction: Direction;
  date: string; // 'YYYY-MM-DD'
  amount: number;
  accountId: string;
  accountName: string;
  remarks: string;
  createdAt: number;
}

export interface DateRange {
  start: string; // 'YYYY-MM-DD' inclusive
  end: string;   // 'YYYY-MM-DD' inclusive
}
