export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'Checking' | 'Savings' | 'Credit' | 'Investment' | 'Cash';
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
}

export interface StockHolding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  market: 'TWSE' | 'NASDAQ' | 'NYSE';
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AppData {
  accounts: BankAccount[];
  transactions: Transaction[];
  stocks: StockHolding[];
}

export const CATEGORIES = [
  '飲食', '交通', '薪資', '居住', '娛樂', '醫療', '投資', '其他', '購物'
];