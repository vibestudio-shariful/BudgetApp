
export type TransactionType = 'INCOME' | 'EXPENSE';
export type DebtType = 'LEND' | 'BORROW';

export interface UserProfile {
  name: string;
  email: string;
  age: string;
  image: string | null;
  isSetup: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  note: string;
}

export interface Debt {
  id: string;
  type: DebtType;
  personName: string;
  amount: number;
  date: string;
  note: string;
  status: 'PENDING' | 'SETTLED';
}

export interface SavingsEntry {
  id: string;
  source: string;
  amount: number;
  date: string;
}

export type Language = 'en' | 'bn';

export interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}
