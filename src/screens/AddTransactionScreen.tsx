import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import CategoryModal, { Category } from '../components/CategoryModal';
import { addTransaction } from '../utils/transactionStorage';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;
  route: RouteProp<RootStackParamList, 'AddTransaction'>;
};

type TransactionType = 'income' | 'expense';

export default function AddTransactionScreen({ navigation, route }: Props) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [lastTransactionAmount, setLastTransactionAmount] = useState('');

  useEffect(() => {
    // Set the initial transaction type based on route params
    if (route.params?.transactionType) {
      setType(route.params.transactionType);
    }
  }, [route.params]);

  useEffect(() => {
    // Reset all fields when transaction type changes
    setSelectedCategory(null);
    setAmount('');
    setNote('');
  }, [type]);

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const numericValue = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setAmount(numericValue);
  };

  const validateForm = () => {
    if (!amount.trim()) {
      Alert.alert('Error', 'Amount is required');
      return false;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Category is required');
      return false;
    }
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return false;
    }
    
    return true;
  };

  const clearForm = () => {
    setAmount('');
    setNote('');
    setSelectedCategory(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Store the amount for the success modal before clearing
      setLastTransactionAmount(parseFloat(amount).toFixed(2));

      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add the transaction using our storage service
      const newTransaction = addTransaction({
        amount: parseFloat(amount),
        note: note.trim(),
        type,
        category: selectedCategory!,
      });

      // Clear the form
      clearForm();
      
      // Show success modal
      setIsLoading(false);
      setSuccessModalVisible(true);

    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.typeSelector}>
        <TouchableOpacity 
          style={[styles.typeButton, type === 'expense' && styles.activeType]}
          onPress={() => setType('expense')}
        >
          <Text style={[styles.typeText, type === 'expense' && styles.activeTypeText]}>
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeButton, type === 'income' && styles.activeType]}
          onPress={() => setType('income')}
        >
          <Text style={[styles.typeText, type === 'income' && styles.activeTypeText]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Category <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.categorySelector}
          onPress={() => setCategoryModalVisible(true)}
        >
          {selectedCategory ? (
            <View style={styles.selectedCategoryContent}>
              <View style={[styles.categoryIcon, { backgroundColor: selectedCategory.color }]}>
                <Ionicons name={selectedCategory.icon} size={20} color="white" />
              </View>
              <Text style={styles.selectedCategoryText}>{selectedCategory.name}</Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>Select a category</Text>
          )}
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Amount <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Note
        </Text>
        <Text style={styles.subtitle}>Add a description for this transaction</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="e.g., Grocery shopping at Walmart"
          value={note}
          onChangeText={setNote}
          multiline
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="white" size="small" />
            <Text style={[styles.buttonText, { marginLeft: 8 }]}>Adding...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Add Transaction</Text>
        )}
      </TouchableOpacity>

      {/* Category Modal */}
      <CategoryModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSelectCategory={setSelectedCategory}
        type={type}
        selectedCategory={selectedCategory || undefined}
      />

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#10b981" />
            </View>
            <Text style={styles.successTitle}>Transaction Added!</Text>
            <Text style={styles.successMessage}>
              {type === 'income' ? 'Income' : 'Expense'} of ₱{lastTransactionAmount} has been added successfully.
            </Text>
            <View style={styles.successButtonContainer}>
              <TouchableOpacity
                style={[styles.successButton, styles.addAnotherButton]}
                onPress={() => setSuccessModalVisible(false)}
              >
                <Text style={styles.addAnotherButtonText}>Add Another</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.successButton, styles.goBackButton]}
                onPress={() => {
                  setSuccessModalVisible(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.goBackButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeType: {
    borderBottomColor: '#3b82f6',
  },
  typeText: {
    color: '#6b7280',
    fontWeight: 'bold',
  },
  activeTypeText: {
    color: '#3b82f6',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  noteInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedCategoryText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
    flex: 1,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  successButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  successButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  addAnotherButton: {
    backgroundColor: '#3b82f6',
  },
  goBackButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  addAnotherButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  goBackButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
});
