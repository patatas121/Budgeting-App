import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import BarChart from '../components/BarChart';
import { Ionicons } from '@expo/vector-icons';

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
  navigation: NativeStackNavigationProp<MainStackParamList, 'Analytics'>;
};

type TimePeriod = 'yearly' | 'monthly' | 'weekly' | 'daily';

export default function AnalyticsScreen({ navigation }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);

  const timePeriods = [
    { key: 'yearly' as TimePeriod, label: 'Yearly' },
    { key: 'monthly' as TimePeriod, label: 'Monthly' },
    { key: 'weekly' as TimePeriod, label: 'Weekly' },
    { key: 'daily' as TimePeriod, label: 'Daily' },
  ];

  const handlePeriodChange = (period: TimePeriod) => {
    if (period !== selectedPeriod) {
      // Start loading all sections
      setIsLoadingChart(true);
      setIsLoadingInsights(true);
      setIsLoadingExpenses(true);
      setSelectedPeriod(period);
      
      // Simulate different loading times for each section
      setTimeout(() => {
        setIsLoadingChart(false);
      }, 600);
      
      setTimeout(() => {
        setIsLoadingInsights(false);
      }, 900);
      
      setTimeout(() => {
        setIsLoadingExpenses(false);
      }, 1200);
    }
  };

  const getInsightData = (period: TimePeriod) => {
    const labels = {
      yearly: ['Last Year', 'This Year'],
      monthly: ['Last Month', 'This Month'],
      weekly: ['Last Week', 'This Week'],
      daily: ['Yesterday', 'Today']
    };
    const multipliers = { yearly: 1000, monthly: 100, weekly: 10, daily: 1 };
    const m = multipliers[period];
    
    return {
      foodDining: { change: 23, direction: 'increased', lastPeriod: 21.5 * m, thisPeriod: 26.45 * m, periodLabel: labels[period][0], currentLabel: labels[period][1] },
      salary: { lastPeriod: 185 * m, thisPeriod: 192 * m, periodLabel: labels[period][0], currentLabel: labels[period][1] },
      transportation: { change: 15, direction: 'decreased', lastPeriod: 18 * m, thisPeriod: 15.3 * m, periodLabel: labels[period][0], currentLabel: labels[period][1] }
    };
  };

  const getExpenseData = (period: TimePeriod) => {
    const categories = [
      { name: 'Food & Dining', icon: 'restaurant', color: '#ef4444' },
      { name: 'Transportation', icon: 'car', color: '#3b82f6' },
      { name: 'Shopping', icon: 'bag', color: '#8b5cf6' },
      { name: 'Entertainment', icon: 'game-controller', color: '#f59e0b' },
      { name: 'Healthcare', icon: 'medical', color: '#10b981' },
      { name: 'Utilities', icon: 'flash', color: '#6b7280' }
    ];
    
    const baseAmounts = { yearly: [30444, 16848, 24000, 18000, 12000, 15600], monthly: [2645, 1530, 2100, 1500, 1000, 1300], weekly: [605, 386, 480, 350, 230, 300], daily: [115, 45, 80, 50, 0, 0] };
    const baseTrans = { yearly: [365, 280, 96, 72, 24, 12], monthly: [28, 22, 8, 6, 2, 1], weekly: [7, 5, 2, 1, 1, 1], daily: [3, 2, 1, 1, 0, 0] };
    
    const amounts = baseAmounts[period];
    const transactions = baseTrans[period];
    const maxAmount = Math.max(...amounts);
    
    return categories.map((cat, i) => ({
      category: cat.name,
      amount: amounts[i],
      transactions: transactions[i],
      icon: cat.icon,
      color: cat.color,
      percentage: maxAmount > 0 ? (amounts[i] / maxAmount) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  };

  const generateHistoricalData = (period: TimePeriod) => {
    const baseData = { yearly: [48000, 36000], monthly: [4000, 3000], weekly: [900, 700], daily: [130, 100] };
    const [income, expenses] = baseData[period];
    
    return Array.from({ length: 6 }, (_, i) => {
      const variance = 0.8 + Math.random() * 0.4;
      const periodName = period === 'yearly' ? `${new Date().getFullYear() - (5 - i)}` :
        period === 'monthly' ? new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en', { month: 'short' }) :
        period === 'weekly' ? `W${Math.max(1, new Date().getWeek() - (5 - i))}` :
        new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en', { weekday: 'short' });
      
      return {
        period: periodName,
        income: Math.round(income * variance),
        expenses: Math.round(expenses * variance)
      };
    });
  };

  const historicalData = generateHistoricalData(selectedPeriod);
  const maxValue = Math.max(...historicalData.flatMap(d => [d.income, d.expenses])) * 1.1;
  const insightData = getInsightData(selectedPeriod);
  const expenseData = getExpenseData(selectedPeriod);

  const SkeletonRect = ({ width, height, style }: { width: number | string, height: number, style?: any }) => (
    <View style={[{ width, height, backgroundColor: colors.azureRadiance[100], borderRadius: 8 }, style]} />
  );

  const ChartSkeleton = () => (
    <View style={styles.chartCard}>
      <SkeletonRect width="60%" height={20} style={{ alignSelf: 'center', marginBottom: 20 }} />
      <View style={{ height: 200, justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20 }}>
        {Array(6).fill(0).map((_, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', marginHorizontal: 4 }}>
            <SkeletonRect width="70%" height={60 + Math.random() * 80} style={{ marginBottom: 8 }} />
            <SkeletonRect width="80%" height={40 + Math.random() * 60} />
          </View>
        ))}
      </View>
      <View style={styles.chartLegend}>
        {['Income', 'Expenses'].map((label, i) => (
          <View key={label} style={styles.legendItem}>
            <SkeletonRect width={12} height={12} style={{ borderRadius: 6, marginRight: 8 }} />
            <SkeletonRect width={50 + i * 10} height={12} />
          </View>
        ))}
      </View>
    </View>
  );

  const InsightCardSkeleton = () => (
    <View style={styles.insightCard}>
      <View style={styles.cardHeader}>
        <SkeletonRect width={40} height={40} style={{ borderRadius: 20, marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <SkeletonRect width="70%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonRect width="50%" height={14} />
        </View>
      </View>
      <SkeletonRect width="100%" height={14} style={{ marginBottom: 16 }} />
      <View style={styles.comparisonContainer}>
        {[0, 1].map(i => (
          <React.Fragment key={i}>
            <View style={styles.comparisonItem}>
              <SkeletonRect width="80%" height={12} style={{ marginBottom: 4 }} />
              <SkeletonRect width="60%" height={16} />
            </View>
            {i === 0 && <View style={styles.comparisonDivider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  const ExpenseItemSkeleton = () => (
    <View style={styles.expenseItem}>
      <SkeletonRect width={48} height={48} style={{ borderRadius: 24, marginRight: 16 }} />
      <View style={styles.expenseDetails}>
        <View style={styles.expenseHeader}>
          <SkeletonRect width="60%" height={16} />
          <SkeletonRect width="25%" height={16} />
        </View>
        <View style={styles.expenseProgressContainer}>
          <SkeletonRect width="80%" height={6} style={{ borderRadius: 3, marginRight: 12 }} />
          <SkeletonRect width={20} height={12} />
        </View>
      </View>
    </View>
  );

  const renderInsightCard = (data: any, icon: string, bgColor: string, title: string, subtitle: string, textColor?: string) => (
    <View style={styles.insightCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryIconContainer, { backgroundColor: bgColor }]}>
          <Ionicons name={icon as any} size={20} color={textColor || '#ef4444'} />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={[styles.changeIndicator, textColor && { color: textColor }]}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.cardSubtitle}>
        {title === 'Salary & Wages' ? 
          `Your primary income source this ${selectedPeriod.replace('ly', '').replace('y', '')}, contributing 85% of total earnings` :
          `${title === 'Transportation' ? (data.direction === 'decreased' ? 'Great job!' : 'Watch out!') + ' Your' : 'Your'} ${title} expenses ${data.direction} by ${data.change}% this ${selectedPeriod.replace('ly', '').replace('y', '')}`
        }
      </Text>
      <View style={styles.comparisonContainer}>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>{data.periodLabel}</Text>
          <Text style={styles.comparisonAmount}>₱{data.lastPeriod.toLocaleString()}</Text>
        </View>
        <View style={styles.comparisonDivider} />
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>{data.currentLabel}</Text>
          <Text style={[styles.comparisonAmount, { color: textColor || (data.direction === 'increased' ? '#ef4444' : '#10b981') }]}>
            ₱{data.thisPeriod.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.azureRadiance[600]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelectorContainer}>
        <View style={styles.periodSelector}>
          {timePeriods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.activePeriod
              ]}
              onPress={() => handlePeriodChange(period.key)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period.key && styles.activePeriodText
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Chart Section */}
        {isLoadingChart ? (
          <ChartSkeleton />
        ) : (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Income vs Expenses Trend</Text>
            
            <BarChart
              data={historicalData}
              maxValue={maxValue}
              selectedPeriod={selectedPeriod}
            />

            <View style={styles.chartLegend}>
              {[{ color: '#10b981', label: 'Income' }, { color: '#ef4444', label: 'Expenses' }].map(item => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Analytics Insights Section */}
        {isLoadingInsights ? (
          <View style={styles.insightsSection}>
            <SkeletonRect width="40%" height={20} style={{ marginBottom: 16 }} />
            {Array(3).fill(0).map((_, i) => <InsightCardSkeleton key={i} />)}
          </View>
        ) : (
          <View style={styles.insightsSection}>
            <Text style={styles.insightsHeading}>Spending Insights</Text>
            {renderInsightCard(
              insightData.foodDining,
              'restaurant',
              '#fef2f2',
              'Food & Dining',
              `${insightData.foodDining.direction === 'increased' ? '↗ Increased' : '↘ Decreased'} by ${insightData.foodDining.change}%`
            )}
            {renderInsightCard(
              insightData.salary,
              'briefcase',
              '#f0fdf4',
              'Salary & Wages',
              'Largest Income',
              '#10b981'
            )}
            {renderInsightCard(
              insightData.transportation,
              'car',
              '#f0f9ff',
              'Transportation',
              `${insightData.transportation.direction === 'increased' ? '↗ Increased' : '↘ Decreased'} by ${insightData.transportation.change}%`,
              colors.azureRadiance[500]
            )}
          </View>
        )}

        {/* Expense Breakdown by Category */}
        {isLoadingExpenses ? (
          <View style={styles.insightsSection}>
            <SkeletonRect width="60%" height={20} style={{ marginBottom: 16 }} />
            {Array(6).fill(0).map((_, index) => <ExpenseItemSkeleton key={index} />)}
          </View>
        ) : (
          <View style={styles.insightsSection}>
            <Text style={styles.insightsHeading}>Your {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Expenses</Text>
            {expenseData.map((expense, index) => (
              <View key={expense.category} style={[styles.expenseItem, index === expenseData.length - 1 && { marginBottom: 0 }]}>
                <View style={[styles.expenseIconContainer, { backgroundColor: `${expense.color}15` }]}>
                  <Ionicons name={expense.icon as any} size={24} color={expense.color} />
                </View>
                <View style={styles.expenseDetails}>
                  <View style={styles.expenseHeader}>
                    <Text style={styles.expenseCategoryName}>{expense.category}</Text>
                    <Text style={styles.expenseAmount}>₱{expense.amount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.expenseProgressContainer}>
                    <View style={styles.progressBarBackground}>
                      <View style={[styles.progressBarFill, { width: `${expense.percentage}%`, backgroundColor: expense.color }]} />
                    </View>
                    <Text style={styles.transactionCount}>{expense.transactions}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Add this helper to Date prototype or create a utility function
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff5ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.azureRadiance[100],
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.azureRadiance[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.azureRadiance[900],
  },
  placeholder: {
    width: 40,
  },
  periodSelectorContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 0,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.azureRadiance[100],
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: colors.azureRadiance[50],
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activePeriod: {
    backgroundColor: colors.azureRadiance[500],
  },
  periodText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activePeriodText: {
    color: 'white',
    fontWeight: '600',
  },
  chartCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: colors.azureRadiance[700],
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  insightsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 16,
    padding: 20,
  },
  insightsHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  changeIndicator: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  comparisonAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  comparisonDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  expenseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  expenseProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  transactionCount: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
