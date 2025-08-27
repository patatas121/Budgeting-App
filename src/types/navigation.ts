import { Ionicons } from '@expo/vector-icons';

export type SavingEntry = {
  id: string;
  amount: number;
  note?: string;
  date: string;
};

export type SavingsChallenge = {
  id: string;
  name: string;
  goalAmount: number;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  dateToFinish: string;
  estimatedAmount: number;
  currentAmount?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  description?: string;
  savingEntries?: SavingEntry[];
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  AddTransaction: { transactionType?: 'income' | 'expense' } | undefined;
  History: undefined;
  BudgetGoal: undefined;
  Analytics: undefined;
  Lending: undefined;
  Settings: undefined;
  Savings: undefined;
  AddSavingsChallenge: undefined;
  SavingsChallengeDetail: { challenge: SavingsChallenge };
  EditSavingsChallenge: { challenge: SavingsChallenge };
};
