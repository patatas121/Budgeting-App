import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import ScreenLoader from '../components/ScreenLoader';
import useScreenTransition from '../hooks/useScreenTransition';

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
  navigation: NativeStackNavigationProp<RootStackParamList, 'Lending'>;
};

export default function LendingScreen({ navigation }: Props) {
  const isLoading = useScreenTransition(500);

  if (isLoading) {
    return <ScreenLoader text="Loading Lending..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Lending</Text>
          <Text style={styles.subtitle}>Manage your loans and lending activities</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Loan Management</Text>
            <Text style={styles.cardDescription}>
              Track your active loans, payment schedules, and interest rates.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lending Opportunities</Text>
            <Text style={styles.cardDescription}>
              Explore peer-to-peer lending and investment opportunities.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment History</Text>
            <Text style={styles.cardDescription}>
              View your lending transaction history and returns.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 24,
    backgroundColor: colors.azureRadiance[500],
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
