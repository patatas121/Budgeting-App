import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, SavingsChallenge, SavingEntry } from '../types/navigation';
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
  navigation: NativeStackNavigationProp<RootStackParamList, 'SavingsChallengeDetail'>;
  route: RouteProp<RootStackParamList, 'SavingsChallengeDetail'>;
};

export default function SavingsChallengeDetailScreen({ navigation, route }: Props) {
  const { challenge } = route.params;
  const { updateChallenge, deleteChallenge } = useChallenges();
  const [currentChallenge, setCurrentChallenge] = useState<SavingsChallenge>(challenge);
  const [showAddSavingModal, setShowAddSavingModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Get saving entries from challenge or initialize empty array
  const savingEntries = currentChallenge.savingEntries || [];

  // Calendar helper functions
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month (allow past and present dates)
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      days.push({
        day,
        date: currentDate,
        isDisabled: currentDate > today // Disable future dates
      });
    }

    return days;
  };

  // Update challenge when route params change (coming back from edit screen)
  useFocusEffect(
    React.useCallback(() => {
      if (route.params.challenge) {
        setCurrentChallenge(route.params.challenge);
      }
    }, [route.params.challenge])
  );

  // Animation values
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  // Handle add saving modal animation
  useEffect(() => {
    if (showAddSavingModal) {
      Animated.parallel([
        Animated.timing(overlayAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [showAddSavingModal]);

  const closeAddSavingModal = () => {
    Animated.parallel([
      Animated.timing(overlayAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowAddSavingModal(false);
      setAmount('');
      setNote('');
      setSelectedDate(new Date());
      setCalendarDate(new Date());
    });
  };

  const calculateProgress = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isFormValid = amount.trim() !== '' && parseFloat(amount) > 0;

  const handleAddSaving = () => {
    if (!isFormValid) return;

    const newEntry: SavingEntry = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      note: note.trim() || undefined,
      date: selectedDate.toISOString(),
    };

    // Update challenge with new saving entry
    const updatedSavingEntries = [newEntry, ...(currentChallenge.savingEntries || [])];
    const updatedChallenge = {
      ...currentChallenge,
      currentAmount: (currentChallenge.currentAmount || 0) + parseFloat(amount),
      savingEntries: updatedSavingEntries
    };
    
    setCurrentChallenge(updatedChallenge);
    updateChallenge(updatedChallenge);

    closeAddSavingModal();
  };

  const handleDeleteChallenge = () => {
    setShowDeleteModal(false);
    setShowOptionsModal(false);
    // Delete from context and navigate back
    deleteChallenge(currentChallenge.id);
    navigation.goBack();
  };

  const currentAmount = currentChallenge.currentAmount || 0;
  const progress = calculateProgress(currentAmount, currentChallenge.goalAmount);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.azureRadiance[600]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Details</Text>
        <TouchableOpacity 
          style={styles.optionsButton}
          onPress={() => setShowOptionsModal(!showOptionsModal)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.azureRadiance[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Challenge Header */}
        <View style={styles.challengeHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name={currentChallenge.icon || 'wallet'} size={32} color={colors.azureRadiance[500]} />
          </View>
          <Text style={styles.challengeName}>{currentChallenge.name}</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressSection}>
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

          {/* Amount Info */}
          <View style={styles.amountInfo}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Total Saved:</Text>
              <Text style={styles.amountValue}>{formatCurrency(currentAmount)}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Goal Amount:</Text>
              <Text style={styles.amountValue}>{formatCurrency(currentChallenge.goalAmount)}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Finish By:</Text>
              <Text style={styles.amountValue}>{formatDate(currentChallenge.dateToFinish)}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Frequency:</Text>
              <Text style={styles.amountValue}>{currentChallenge.frequency}</Text>
            </View>
          </View>
        </View>

        {/* Add Saving Button */}
        <TouchableOpacity 
          style={styles.addSavingButton}
          onPress={() => setShowAddSavingModal(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addSavingButtonText}>Add Saving</Text>
        </TouchableOpacity>

        {/* History Section */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Saving History</Text>
          {savingEntries.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>No savings added yet</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {savingEntries.map((entry, index) => (
                <View key={entry.id}>
                  <View style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyDate}>{formatDateTime(entry.date)}</Text>
                      {entry.note && (
                        <Text style={styles.historyNote}>{entry.note}</Text>
                      )}
                    </View>
                    <Text style={styles.historyAmount}>{formatCurrency(entry.amount)}</Text>
                  </View>
                  {index < savingEntries.length - 1 && <View style={styles.historySeparator} />}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Saving Modal */}
      <Modal
        visible={showAddSavingModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeAddSavingModal}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: overlayAnimation,
            },
          ]}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={closeAddSavingModal}
          />
          <Animated.View 
            style={[
              styles.addSavingModalContent,
              {
                transform: [
                  {
                    translateY: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [500, 0],
                    }),
                  },
                ],
                opacity: slideAnimation,
              },
            ]}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={() => {}}
              style={{ flex: 1 }}
            >
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Add Saving</Text>
              
              {/* Amount Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount</Text>
                <View style={[styles.inputWrapper, amount.length > 0 && styles.inputWrapperFocused]}>
                  <Text style={styles.currencySymbol}>₱</Text>
                  <TextInput
                    style={styles.textInput}
                    value={amount}
                    onChangeText={(text) => {
                      // Only allow numbers and decimal point
                      const cleanedText = text.replace(/[^0-9.]/g, '');
                      // Ensure only one decimal point
                      const parts = cleanedText.split('.');
                      if (parts.length > 2) {
                        return;
                      }
                      setAmount(cleanedText);
                    }}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Note Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Note (Optional)</Text>
                <View style={[styles.inputWrapper, note.length > 0 && styles.inputWrapperFocused]}>
                  <TextInput
                    style={styles.textInput}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Add a note..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                  />
                </View>
              </View>

              {/* Date Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {selectedDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Save Button */}
              <TouchableOpacity 
                style={[
                  styles.saveButton, 
                  !isFormValid && styles.saveButtonDisabled
                ]}
                onPress={handleAddSaving}
                disabled={!isFormValid}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsModalContent}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsModal(false);
                navigation.navigate('EditSavingsChallenge', { challenge });
              }}
            >
              <Ionicons name="create-outline" size={24} color={colors.azureRadiance[500]} />
              <Text style={styles.optionText}>Edit Challenge</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsModal(false);
                setShowDeleteModal(true);
              }}
            >
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
              <Text style={[styles.optionText, { color: '#EF4444' }]}>Delete Challenge</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteTitle}>Delete Challenge</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete this savings challenge? This action cannot be undone.
            </Text>
            <View style={styles.deleteButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteChallenge}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <TouchableOpacity 
            style={styles.dateModalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.modalTitle}>Select Date</Text>
            
            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => {
                  const newDate = new Date(calendarDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCalendarDate(newDate);
                }}
              >
                <Ionicons name="chevron-back" size={20} color={colors.azureRadiance[500]} />
              </TouchableOpacity>
              
              <Text style={styles.calendarHeaderText}>
                {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => {
                  const newDate = new Date(calendarDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCalendarDate(newDate);
                }}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.azureRadiance[500]} />
              </TouchableOpacity>
            </View>

            {/* Days of Week Header */}
            <View style={styles.daysOfWeekHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.dayOfWeekText}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {generateCalendarDays(calendarDate).map((dayObj, index) => (
                <View
                  key={index}
                  style={[
                    styles.calendarDay,
                    !dayObj && styles.calendarDayEmpty,
                  ]}
                >
                  {dayObj ? (
                    <TouchableOpacity
                      style={[
                        styles.calendarDayButton,
                        dayObj.isDisabled && styles.calendarDayDisabled,
                        dayObj.date.toDateString() === selectedDate.toDateString() && styles.calendarDaySelected
                      ]}
                      onPress={() => {
                        if (!dayObj.isDisabled) {
                          setSelectedDate(dayObj.date);
                          setShowDatePicker(false);
                        }
                      }}
                      disabled={dayObj.isDisabled}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        dayObj.isDisabled && styles.calendarDayTextDisabled,
                        dayObj.date.toDateString() === selectedDate.toDateString() && styles.calendarDayTextSelected
                      ]}>
                        {dayObj.day}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  optionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.azureRadiance[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  challengeHeader: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.azureRadiance[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.azureRadiance[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: colors.azureRadiance[100],
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.azureRadiance[600],
  },
  amountInfo: {
    width: '100%',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 16,
    color: colors.azureRadiance[600],
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.azureRadiance[900],
  },
  addSavingButton: {
    backgroundColor: colors.azureRadiance[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: colors.azureRadiance[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addSavingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historySection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.azureRadiance[900],
    marginBottom: 16,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: colors.azureRadiance[400],
  },
  historyList: {
    // No additional styling needed
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  historyLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.azureRadiance[700],
    marginBottom: 4,
  },
  historyNote: {
    fontSize: 14,
    color: colors.azureRadiance[500],
    lineHeight: 20,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.azureRadiance[900],
    marginLeft: 16,
  },
  historySeparator: {
    height: 1,
    backgroundColor: colors.azureRadiance[100],
    marginVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSavingModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.azureRadiance[900],
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.azureRadiance[700],
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputWrapperFocused: {
    borderColor: colors.azureRadiance[500],
    borderWidth: 2,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  saveButton: {
    backgroundColor: colors.azureRadiance[500],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.azureRadiance[200],
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  optionsModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 8,
    position: 'absolute',
    top: 100,
    right: 16,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: colors.azureRadiance[700],
    marginLeft: 12,
  },
  optionCancel: {
    borderTopWidth: 1,
    borderTopColor: colors.azureRadiance[100],
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  optionCancelText: {
    fontSize: 16,
    color: colors.azureRadiance[500],
    fontWeight: '600',
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.azureRadiance[900],
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 16,
    color: colors.azureRadiance[600],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.azureRadiance[100],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.azureRadiance[700],
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Date picker styles
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  dateModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    maxHeight: '80%',
    width: '90%',
  },
  // Calendar styles
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  calendarNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.azureRadiance[50],
  },
  calendarHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.azureRadiance[800],
  },
  daysOfWeekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: colors.azureRadiance[600],
    paddingVertical: 4,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  calendarDayEmpty: {
    // No background or border for empty slots
  },
  calendarDayButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDaySelected: {
    backgroundColor: colors.azureRadiance[500],
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.azureRadiance[800],
  },
  calendarDayTextDisabled: {
    color: colors.azureRadiance[400],
  },
  calendarDayTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
});
