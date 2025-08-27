import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import WaveBackground from '../components/WaveBackground';
import CurrencyDropdown from '../components/CurrencyDropdown';
import { Ionicons } from '@expo/vector-icons';
import { getRecentTransactions, getTotalIncome, getTotalExpenses, getBalance, Transaction } from '../utils/transactionStorage';
import { useFocusEffect } from '@react-navigation/native';

// Azure Radiance Color Theme
const colors = {
  azureRadiance: {
    50: '#eff5ff',
    100: '#dbe8fe',
    200: '#bfd7fe',
    300: '#93bbfd',
    400: '#609afa',
    500: '#3b82f6',
    600: '#2570eb',
    700: '#1d64d8',
    800: '#1e55af',
    900: '#1e478a',
    950: '#172e54',
  }
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

type AdviceCard = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  category: string;
};

const adviceCards: AdviceCard[] = [
  {
    id: '1',
    title: 'Check Your Credit Report',
    description: 'Monitor credit health monthly',
    icon: 'card',
    color: '#ffffff',
    category: 'Credit'
  },
  {
    id: '2',
    title: 'Build Emergency Fund',
    description: 'Save 3-6 months expenses',
    icon: 'shield-checkmark',
    color: '#ffffff',
    category: 'Savings'
  },
  {
    id: '3',
    title: 'Smart Budgeting',
    description: 'Track and control spending',
    icon: 'calculator',
    color: '#ffffff',
    category: 'Budget'
  },
  {
    id: '4',
    title: 'Start Investing',
    description: 'Grow wealth with simple steps',
    icon: 'trending-up',
    color: '#ffffff',
    category: 'Invest'
  },
  {
    id: '5',
    title: 'Pay Off Debt',
    description: 'Become debt-free faster',
    icon: 'remove-circle',
    color: '#ffffff',
    category: 'Debt'
  },
  {
    id: '6',
    title: 'Tax Preparation',
    description: 'Maximize your refund',
    icon: 'document-text',
    color: '#ffffff',
    category: 'Taxes'
  }
];

export default function DashboardScreen({ navigation }: Props) {
  const [selectedCurrency, setSelectedCurrency] = useState({
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    flag: '🇵🇭'
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [isLoadingHeader, setIsLoadingHeader] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(true);

  const refreshData = () => {
    // Start loading all sections
    setIsLoadingHeader(true);
    setIsLoadingCards(true);
    setIsLoadingTransactions(true);
    setIsLoadingAdvice(true);

    // Add a brief loading delay to match other screens
    setTimeout(() => {
      // Load all data and stop all loading states
      const recentTransactions = getRecentTransactions(4);
      const income = getTotalIncome();
      const expenses = getTotalExpenses();
      const currentBalance = getBalance();

      setTransactions(recentTransactions);
      setTotalIncome(income);
      setTotalExpenses(expenses);
      setBalance(currentBalance);

      // Stop all loading states simultaneously
      setIsLoadingHeader(false);
      setIsLoadingCards(false);
      setIsLoadingTransactions(false);
      setIsLoadingAdvice(false);
    }, 300);
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [])
  );

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const toggleNoteExpansion = (transactionId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  const truncateNote = (note: string, maxLength: number = 30) => {
    if (note.length <= maxLength) return note;
    return note.substring(0, maxLength) + '...';
  };

  // Skeleton Loading Components
  const SkeletonRect = ({ width, height, style }: { width: number | string, height: number, style?: any }) => (
    <View style={[{
      width,
      height,
      backgroundColor: colors.azureRadiance[100],
      borderRadius: 8,
    }, style]} />
  );

  const HeaderSkeleton = () => (
    <View style={styles.header}>
      <View style={styles.currencySection}>
        <SkeletonRect width={120} height={40} style={{ borderRadius: 20 }} />
      </View>
      <SkeletonRect width="40%" height={16} style={{ alignSelf: 'center', marginBottom: 8 }} />
      <SkeletonRect width="60%" height={32} style={{ alignSelf: 'center', marginBottom: 20 }} />
      <WaveBackground />
    </View>
  );

  const ToolsSkeleton = () => (
    <View style={styles.toolsSection}>
      <View style={styles.toolsHeader}>
        <SkeletonRect width="20%" height={20} />
      </View>
      <View style={styles.toolsGrid}>
        {[...Array(4)].map((_, index) => (
          <View key={index} style={styles.toolItem}>
            <SkeletonRect width={48} height={48} style={{ borderRadius: 24, marginBottom: 8 }} />
            <SkeletonRect width="80%" height={14} />
          </View>
        ))}
      </View>
    </View>
  );

  const StatCardSkeleton = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <SkeletonRect width={24} height={24} style={{ borderRadius: 12, marginRight: 8 }} />
        <SkeletonRect width="50%" height={20} />
      </View>
      <View style={styles.summaryRow}>
        {[...Array(3)].map((_, index) => (
          <View key={index} style={styles.summaryItem}>
            <SkeletonRect width={20} height={20} style={{ borderRadius: 10, marginBottom: 8 }} />
            <SkeletonRect width="60%" height={14} style={{ marginBottom: 4 }} />
            <SkeletonRect width="80%" height={16} />
          </View>
        ))}
      </View>
    </View>
  );

  const TransactionSkeleton = () => (
    <View style={styles.transactionCard}>
      <SkeletonRect width={40} height={40} style={{ borderRadius: 20, marginRight: 12 }} />
      <View style={styles.transactionDetails}>
        <SkeletonRect width="70%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonRect width="90%" height={14} style={{ marginBottom: 4 }} />
        <SkeletonRect width="40%" height={12} />
      </View>
      <View style={styles.transactionAmountContainer}>
        <SkeletonRect width={80} height={16} />
      </View>
    </View>
  );

  const AdviceCardSkeleton = () => (
    <View style={styles.adviceCard}>
      <SkeletonRect width={32} height={32} style={{ borderRadius: 16, marginBottom: 12 }} />
      <SkeletonRect width="90%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonRect width="100%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonRect width="60%" height={12} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header Section */}
        {isLoadingHeader ? (
          <HeaderSkeleton />
        ) : (
          <View style={styles.header}>
            <View style={styles.currencySection}>
              <CurrencyDropdown
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
                compact={true}
              />
            </View>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balance}>{selectedCurrency.symbol}{balance.toFixed(2)}</Text>
            <WaveBackground />
          </View>
        )}

        {/* Tools Section */}
        {isLoadingCards ? (
          <ToolsSkeleton />
        ) : (
          <View style={styles.toolsSection}>
            <View style={styles.toolsHeader}>
              <Text style={styles.toolsTitle}>Tools</Text>
            </View>
            <View style={styles.toolsGrid}>
            <TouchableOpacity 
              style={styles.toolItem}
              onPress={() => navigation.navigate('Savings')}
            >
              <View style={[styles.toolIcon, { backgroundColor: '#bfd7fe' }]}>
                <Ionicons name="cash" size={24} color="#2570eb" />
              </View>
              <Text style={styles.toolLabel}>Savings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.toolItem}
              onPress={() => navigation.navigate('Analytics')}
            >
              <View style={[styles.toolIcon, { backgroundColor: '#bfd7fe' }]}>
                <Ionicons name="pie-chart" size={24} color="#2570eb" />
              </View>
              <Text style={styles.toolLabel}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.toolItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={[styles.toolIcon, { backgroundColor: '#bfd7fe' }]}>
                <Ionicons name="help-circle" size={24} color="#2570eb" />
              </View>
              <Text style={styles.toolLabel}>Help</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.toolItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={[styles.toolIcon, { backgroundColor: '#bfd7fe' }]}>
                <Ionicons name="person" size={24} color="#2570eb" />
              </View>
              <Text style={styles.toolLabel}>Account</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}

        {/* Financial Overview Card */}
        {isLoadingCards ? (
          <StatCardSkeleton />
        ) : (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="analytics" size={24} color={colors.azureRadiance[500]} />
              <Text style={styles.summaryTitle}>Financial Overview</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryItem, styles.incomeItem]}>
                <View style={styles.summaryIconContainer}>
                  <Ionicons name="trending-up" size={20} color="#10b981" />
                </View>
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={[styles.summaryAmount, { color: '#10b981' }]}>₱{totalIncome.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryItem, styles.expenseItem]}>
                <View style={styles.summaryIconContainer}>
                  <Ionicons name="trending-down" size={20} color="#ef4444" />
                </View>
                <Text style={styles.summaryLabel}>Spent</Text>
                <Text style={[styles.summaryAmount, { color: '#ef4444' }]}>₱{totalExpenses.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryItem, styles.savingsItem]}>
                <View style={styles.summaryIconContainer}>
                  <Ionicons name="wallet" size={20} color={colors.azureRadiance[500]} />
                </View>
                <Text style={styles.summaryLabel}>Saved</Text>
                <Text style={[
                  styles.summaryAmount, 
                  { color: balance >= 0 ? '#10b981' : '#ef4444' }
                ]}>
                  ₱{balance.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Financial Tips & Advice */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Tips & Advice</Text>
          {isLoadingAdvice ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adviceCardsContainer}>
              {[...Array(3)].map((_, index) => (
                <AdviceCardSkeleton key={index} />
              ))}
            </ScrollView>
          ) : (
            <FlatList
              data={adviceCards}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.adviceCardsContainer}
              ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.adviceCard}>
                  <Image 
                    source={require('../../assets/dot.png')} 
                    style={styles.dotImage}
                  />
                  <View style={styles.adviceCardContent}>
                    <View style={styles.adviceCardText}>
                      <Text style={styles.adviceCategory}>{item.category}</Text>
                      <Text style={styles.adviceTitle}>{item.title}</Text>
                      <Text style={styles.adviceDescription}>{item.description}</Text>
                    </View>
                    <View style={styles.adviceIconContainer}>
                      <Ionicons name={item.icon} size={28} color="#3b82f6" />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </View>
          {isLoadingTransactions ? (
            <View>
              {[...Array(3)].map((_, index) => (
                <TransactionSkeleton key={index} />
              ))}
            </View>
          ) : (
            transactions.slice(0, 3).map((transaction) => {
            const isExpanded = expandedNotes.has(transaction.id);
            const shouldTruncate = transaction.note && transaction.note.length > 30;
            const displayNote = shouldTruncate ? 
              (isExpanded ? transaction.note : truncateNote(transaction.note)) : 
              transaction.note;

            return (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionIconContainer}>
                  <Ionicons 
                    name={transaction.category.icon} 
                    size={24} 
                    color={transaction.category.color} 
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionNote}>{transaction.category.name}</Text>
                  {transaction.note ? (
                    <TouchableOpacity 
                      onPress={() => shouldTruncate ? toggleNoteExpansion(transaction.id) : null}
                      activeOpacity={shouldTruncate ? 0.7 : 1}
                    >
                      <Text style={[
                        styles.transactionCategory,
                        shouldTruncate && styles.clickableNote
                      ]}
                      numberOfLines={isExpanded ? undefined : 1}
                      >
                        {displayNote}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.transactionCategory} numberOfLines={1}>No note</Text>
                  )}
                  <Text style={styles.transactionTime}>{formatTimeAgo(transaction.timestamp)}</Text>
                </View>
                <View style={styles.transactionAmountContainer}>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'income' ? '#10b981' : '#ef4444' }
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}{selectedCurrency.symbol}{transaction.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.azureRadiance[50], // #eff5ff
  },
  header: {
    padding: 40,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: colors.azureRadiance[500],
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceLabel: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  balance: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  currencySection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adviceCardsContainer: {
    paddingHorizontal: 16,
  },
  adviceCard: {
    width: 280,
    backgroundColor: colors.azureRadiance[500],
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.azureRadiance[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  adviceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceCardText: {
    flex: 1,
    marginRight: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  adviceCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'left',
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    lineHeight: 20,
    textAlign: 'left',
  },
  adviceDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    textAlign: 'left',
  },
  adviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotImage: {
    position: 'absolute',
    bottom: -48,
    right: -41,
    width: 160,
    height: 160,
    opacity: 0.3,
  },
  transactionCard: {
    backgroundColor: '#fff', // #bfd7fe
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.azureRadiance[50], // #eff5ff
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  clickableNote: {
    textDecorationColor: '#9ca3af',
  },
  transactionTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff', // #bfd7fe
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1f2937',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  incomeItem: {
    backgroundColor: colors.azureRadiance[50], // #eff5ff
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  expenseItem: {
    backgroundColor: colors.azureRadiance[50], // #eff5ff
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  savingsItem: {
    backgroundColor: colors.azureRadiance[50],
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toolsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  toolsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toolsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1f2937',
  },
  toolsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toolItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
});
