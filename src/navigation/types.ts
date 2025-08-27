export type RootStackParamList = {
  Auth: undefined;
  MainApp: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  AddTransaction: { type: 'income' | 'expense' };
  Analytics: undefined;
  Settings: undefined;
  BudgetGoal: undefined;
  History: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  HistoryTab: undefined;
  AnalyticsTab: undefined;
  SettingsTab: undefined;
};
