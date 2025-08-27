import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../navigation/types';
import { getTransactions, Transaction } from '../utils/transactionStorage';
import { useFocusEffect } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'History'>;
};

export default function HistoryScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const refreshData = () => {
    setIsLoadingSearch(true);
    setIsLoadingTransactions(true);
    
    // Simulate search loading
    setTimeout(() => {
      setIsLoadingSearch(false);
    }, 400);
    
    // Simulate transaction loading
    setTimeout(() => {
      const allTransactions = getTransactions();
      setTransactions(allTransactions);
      setIsLoadingTransactions(false);
    }, 800);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      setTimeout(() => {
        // Filter transactions based on search query
        const allTransactions = getTransactions();
        const filteredTransactions = allTransactions.filter(transaction =>
          transaction.category.name.toLowerCase().includes(query.toLowerCase()) ||
          (transaction.note && transaction.note.toLowerCase().includes(query.toLowerCase()))
        );
        setTransactions(filteredTransactions);
        setIsSearching(false);
      }, 400);
    } else {
      // If search is cleared, show all transactions
      const allTransactions = getTransactions();
      setTransactions(allTransactions);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [])
  );

  const formatTimeAgo = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
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

  const truncateNote = (note: string, maxLength: number = 50) => {
    if (note.length <= maxLength) return note;
    return note.substring(0, maxLength) + '...';
  };

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

  // Skeleton Loading Components
  const SkeletonRect = ({ width, height, style }: { width: number | string, height: number, style?: any }) => (
    <View style={[{
      width,
      height,
      backgroundColor: colors.azureRadiance[100],
      borderRadius: 8,
    }, style]} />
  );

  const SearchSkeleton = () => (
    <View style={[styles.searchInput, { backgroundColor: colors.azureRadiance[50] }]}>
      <SkeletonRect width="50%" height={16} />
    </View>
  );

  const TransactionSkeleton = () => (
    <View style={styles.transactionCard}>
      <SkeletonRect width={48} height={48} style={{ borderRadius: 24, marginRight: 16 }} />
      <View style={styles.transactionDetails}>
        <SkeletonRect width="70%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonRect width="90%" height={14} style={{ marginBottom: 6 }} />
        <SkeletonRect width="40%" height={12} />
      </View>
      <View style={styles.transactionAmountContainer}>
        <SkeletonRect width={80} height={16} />
      </View>
    </View>
  );

  const renderTransaction = ({ item }: any) => {
    const isExpanded = expandedNotes.has(item.id);
    const shouldTruncate = item.note && item.note.length > 50;
    const displayNote = shouldTruncate ? 
      (isExpanded ? item.note : truncateNote(item.note)) : 
      item.note;

    return (
      <View style={[styles.transactionCard, { backgroundColor: '#ffffff' }]}>
        <View style={[styles.transactionIconContainer, { backgroundColor: `${item.category.color}15` }]}>
          <Ionicons 
            name={item.category.icon} 
            size={24} 
            color={item.category.color} 
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>{item.category.name}</Text>
          {item.note ? (
            <TouchableOpacity 
              onPress={() => shouldTruncate ? toggleNoteExpansion(item.id) : null}
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
          <Text style={styles.transactionTime}>{formatTimeAgo(item.timestamp)}</Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text style={[
            styles.transactionAmount,
            { color: item.type === 'income' ? '#10b981' : '#ef4444' }
          ]}>
            {item.type === 'income' ? '+' : '-'}₱{item.amount.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.azureRadiance[50] }]}>
      {/* Search Input */}
      {isLoadingSearch ? (
        <SearchSkeleton />
      ) : (
        <TextInput
          style={[styles.searchInput, { backgroundColor: '#ffffff' }]}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      )}

      {/* Transaction List */}
      {isLoadingTransactions ? (
        <View style={styles.list}>
          {[...Array(8)].map((_, index) => (
            <TransactionSkeleton key={index} />
          ))}
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Loading Overlay for search */}
      {isSearching && (
        <View style={styles.searchLoadingOverlay}>
          <View style={styles.searchLoadingContainer}>
            <ActivityIndicator size="small" color={colors.azureRadiance[500]} />
            <Text style={styles.searchLoadingText}>Searching...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  list: {
    padding: 16,
  },
  transactionCard: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
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
    marginRight: 10,
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
  searchLoadingOverlay: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});
