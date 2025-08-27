import { Category } from '../components/CategoryModal';

export interface Transaction {
  id: string;
  amount: number;
  note: string;
  type: 'income' | 'expense';
  category: Category;
  timestamp: Date;
}

// Simple in-memory storage for now (in a real app, you'd use AsyncStorage or a database)
let transactions: Transaction[] = [
  {
    id: '1',
    amount: 45.50,
    note: 'Lunch at restaurant',
    type: 'expense',
    category: { id: '1', name: 'Food & Dining', icon: 'restaurant', color: '#ef4444' },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '2',
    amount: 2500,
    note: 'Monthly salary',
    type: 'income',
    category: { id: '11', name: 'Salary', icon: 'briefcase', color: '#10b981' },
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: '3',
    amount: 120,
    note: 'Groceries shopping',
    type: 'expense',
    category: { id: '3', name: 'Shopping', icon: 'bag', color: '#ec4899' },
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: '4',
    amount: 85,
    note: 'Electric bill payment',
    type: 'expense',
    category: { id: '5', name: 'Bills & Utilities', icon: 'receipt', color: '#06b6d4' },
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: '5',
    amount: 300,
    note: 'Freelance project payment',
    type: 'income',
    category: { id: '12', name: 'Freelance', icon: 'laptop', color: '#06b6d4' },
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    id: '6',
    amount: 65,
    note: 'Gas station',
    type: 'expense',
    category: { id: '2', name: 'Transportation', icon: 'car', color: '#f97316' },
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  },
];

export const addTransaction = (transactionData: Omit<Transaction, 'id' | 'timestamp'>): Transaction => {
  const newTransaction: Transaction = {
    ...transactionData,
    id: Date.now().toString(),
    timestamp: new Date(),
  };
  
  transactions.unshift(newTransaction); // Add to beginning of array (most recent first)
  return newTransaction;
};

export const getTransactions = (): Transaction[] => {
  return [...transactions]; // Return a copy to prevent direct mutation
};

export const getRecentTransactions = (limit: number = 5): Transaction[] => {
  return transactions.slice(0, limit);
};

export const getTotalIncome = (): number => {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((total, t) => total + t.amount, 0);
};

export const getTotalExpenses = (): number => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((total, t) => total + t.amount, 0);
};

export const getBalance = (): number => {
  return getTotalIncome() - getTotalExpenses();
};
