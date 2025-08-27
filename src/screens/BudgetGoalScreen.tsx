import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import ScreenLoader from '../components/ScreenLoader';
import useScreenTransition from '../hooks/useScreenTransition';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'BudgetGoal'>;
};

// Mock data for budget goals
const mockBudgetGoals = [
  { id: '1', category: 'Food', amount: 500, spent: 300 },
  { id: '2', category: 'Transport', amount: 200, spent: 150 },
  { id: '3', category: 'Entertainment', amount: 300, spent: 200 },
];

export default function BudgetGoalScreen({ navigation }: Props) {
  const [newGoal, setNewGoal] = useState({ category: '', amount: '' });
  const isLoading = useScreenTransition(400);

  if (isLoading) {
    return <ScreenLoader text="Loading Budget Goals..." />;
  }

  const renderProgressBar = (spent: number, total: number) => {
    const percentage = (spent / total) * 100;
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
      </View>
    );
  };

  const renderBudgetGoal = ({ item }: any) => (
    <View style={styles.goalCard}>
      <Text style={styles.categoryText}>{item.category}</Text>
      <Text style={styles.amountText}>
        ₱{item.spent} / ₱{item.amount}
      </Text>
      {renderProgressBar(item.spent, item.amount)}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.addGoalSection}>
        <TextInput
          style={styles.input}
          placeholder="Category"
          value={newGoal.category}
          onChangeText={(text) => setNewGoal({ ...newGoal, category: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={newGoal.amount}
          onChangeText={(text) => setNewGoal({ ...newGoal, amount: text })}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Goal</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockBudgetGoals}
        renderItem={renderBudgetGoal}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  addGoalSection: {
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  goalCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amountText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
});
