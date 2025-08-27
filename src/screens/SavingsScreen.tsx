import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SavingsChallenge } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useChallenges } from '../context/ChallengesContext';

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
  navigation: NativeStackNavigationProp<RootStackParamList, 'Savings'>;
};

export default function SavingsScreen({ navigation }: Props) {
  const { challenges } = useChallenges();

  const calculateProgress = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString()}`;
  };

  const renderChallengeItem = ({ item }: { item: SavingsChallenge }) => {
    const currentAmount = item.currentAmount || 0;
    const targetAmount = item.goalAmount;
    const progress = calculateProgress(currentAmount, targetAmount);
    
    return (
      <TouchableOpacity 
        style={styles.challengeItem}
        onPress={() => navigation.navigate('SavingsChallengeDetail', { challenge: item })}
      >
        <View style={styles.challengeContent}>
          <View style={[styles.iconContainer, { backgroundColor: colors.azureRadiance[100] }]}>
            <Ionicons name={item.icon || 'wallet'} size={24} color={colors.azureRadiance[500]} />
          </View>
          
          <View style={styles.challengeDetails}>
            <Text style={styles.challengeName}>{item.name}</Text>
            <Text style={styles.challengeAmount}>
              {formatCurrency(currentAmount)} / {formatCurrency(targetAmount)}
            </Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: colors.azureRadiance[500]
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
            </View>
          </View>
          
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color={colors.azureRadiance[400]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image 
        source={require('../../assets/empty.png')} 
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>No Savings Challenges Yet!</Text>
      <Text style={styles.emptySubtext}>Start your first savings challenge to reach your financial goals</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.azureRadiance[600]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Savings Challenges</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {challenges.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{challenges.length}</Text>
                <Text style={styles.statLabel}>Active Challenges</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {formatCurrency(challenges.reduce((sum, challenge) => sum + challenge.currentAmount, 0))}
                </Text>
                <Text style={styles.statLabel}>Total Saved</Text>
              </View>
            </View>

            <FlatList
              data={challenges}
              renderItem={renderChallengeItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddSavingsChallenge')}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Savings Challenge</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.azureRadiance[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.azureRadiance[100],
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
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.azureRadiance[700],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.azureRadiance[500],
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  challengeItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  challengeDetails: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.azureRadiance[900],
    marginBottom: 4,
  },
  challengeAmount: {
    fontSize: 14,
    color: colors.azureRadiance[600],
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.azureRadiance[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.azureRadiance[600],
    minWidth: 35,
    textAlign: 'right',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C5C5C5',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C5C5C5',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: colors.azureRadiance[100],
  },
  addButton: {
    backgroundColor: colors.azureRadiance[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.azureRadiance[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
