import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BarChartData = {
  period: string;
  income: number;
  expenses: number;
};

type BarChartProps = {
  data: BarChartData[];
  maxValue: number;
  selectedPeriod: string;
};

export default function BarChart({ data, maxValue, selectedPeriod }: BarChartProps) {
  const currentData = data[data.length - 1]; // Get the latest period data

  // Helper function to get the proper period label
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'yearly':
        return 'year';
      case 'monthly':
        return 'month';
      case 'weekly':
        return 'week';
      case 'daily':
        return 'day';
      default:
        return period.slice(0, -2); // fallback for other cases
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {data.map((item, index) => {
          const incomeHeight = (item.income / maxValue) * 100;
          const expensesHeight = (item.expenses / maxValue) * 100;
          
          return (
            <View key={index} style={styles.barGroup}>
              <View style={styles.bars}>
                <View style={[styles.bar, styles.incomeBar, { height: incomeHeight }]} />
                <View style={[styles.bar, styles.expenseBar, { height: expensesHeight }]} />
              </View>
              <Text style={styles.periodLabel}>{item.period}</Text>
            </View>
          );
        })}
      </View>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income this {getPeriodLabel(selectedPeriod)}</Text>
          <Text style={styles.incomeAmount}>₱{currentData.income.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expenses this {getPeriodLabel(selectedPeriod)}</Text>
          <Text style={styles.expenseAmount}>₱{currentData.expenses.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    marginBottom: 8,
  },
  bar: {
    width: 12,
    marginHorizontal: 1,
    borderRadius: 2,
    minHeight: 4,
  },
  incomeBar: {
    backgroundColor: '#10b981',
  },
  expenseBar: {
    backgroundColor: '#ef4444',
  },
  periodLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
});
