export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  source: string;
  date: string; // ISO string
  note?: string;
  category?: string;
}

export interface DailySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}
