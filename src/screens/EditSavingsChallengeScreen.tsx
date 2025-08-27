import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator, Modal, Platform, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
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
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditSavingsChallenge'>;
  route: RouteProp<RootStackParamList, 'EditSavingsChallenge'>;
};

type FrequencyType = 'Daily' | 'Weekly' | 'Monthly';

export default function EditSavingsChallengeScreen({ navigation, route }: Props) {
  const { challenge } = route.params;
  const { updateChallenge } = useChallenges();
  
  const [challengeName, setChallengeName] = useState(challenge.name);
  const [goalAmount, setGoalAmount] = useState(challenge.goalAmount.toString());
  const [frequency, setFrequency] = useState<FrequencyType>(challenge.frequency);
  const [dateToFinish, setDateToFinish] = useState<Date | null>(new Date(challenge.dateToFinish));
  const [selectedIcon, setSelectedIcon] = useState<keyof typeof Ionicons.glyphMap>(challenge.icon || 'wallet');
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isLoading, setSaving] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState(challenge.estimatedAmount);

  // Icon options for savings challenges
  const iconOptions: { name: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { name: 'wallet', label: 'Personal' },
    { name: 'car', label: 'Car' },
    { name: 'home', label: 'House' },
    { name: 'airplane', label: 'Travel' },
    { name: 'school', label: 'Education' },
    { name: 'medical', label: 'Health' },
    { name: 'gift', label: 'Gift' },
    { name: 'diamond', label: 'Luxury' },
    { name: 'restaurant', label: 'Food' },
    { name: 'game-controller', label: 'Entertainment' },
    { name: 'fitness', label: 'Fitness' },
    { name: 'phone-portrait', label: 'Gadget' },
  ];

  // Animation values
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  // Check if all fields are filled
  const isFormValid = challengeName.trim() !== '' && goalAmount.trim() !== '' && parseFloat(goalAmount) > 0 && dateToFinish !== null;

  // Handle icon picker animation
  useEffect(() => {
    if (showIconPicker) {
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
  }, [showIconPicker]);

  const closeIconPicker = () => {
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
      setShowIconPicker(false);
    });
  };

  // Calculate estimated savings amount
  useEffect(() => {
    if (goalAmount && dateToFinish) {
      const goal = parseFloat(goalAmount);
      const today = new Date();
      const diffTime = dateToFinish.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0 && goal > 0) {
        let periodsCount = 0;
        
        switch (frequency) {
          case 'Daily':
            periodsCount = diffDays;
            break;
          case 'Weekly':
            periodsCount = Math.ceil(diffDays / 7);
            break;
          case 'Monthly':
            periodsCount = Math.ceil(diffDays / 30);
            break;
        }

        if (periodsCount > 0) {
          setEstimatedAmount(goal / periodsCount);
        } else {
          setEstimatedAmount(0);
        }
      } else {
        setEstimatedAmount(0);
      }
    }
  }, [goalAmount, frequency, dateToFinish]);

  const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
      days.push({
        day,
        date: currentDate,
        isDisabled: currentDate <= minDate
      });
    }

    return days;
  };

  const [calendarDate, setCalendarDate] = useState(new Date());

  const handleSaveChallenge = async () => {
    if (!isFormValid) return;

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedChallenge: SavingsChallenge = {
        ...challenge,
        name: challengeName,
        goalAmount: parseFloat(goalAmount),
        frequency,
        dateToFinish: dateToFinish?.toISOString() || '',
        estimatedAmount,
        icon: selectedIcon,
      };

      // Update in context
      updateChallenge(updatedChallenge);
      setSaving(false);
      
      // Navigate back to detail screen with updated challenge
      navigation.navigate('SavingsChallengeDetail', { 
        challenge: updatedChallenge 
      });
    } catch (error) {
      setSaving(false);
      Alert.alert('Error', 'Failed to update savings challenge. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.azureRadiance[600]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Savings Challenge</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Challenge Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Challenge Name</Text>
          <View style={[styles.inputWrapper, challengeName.length > 0 && styles.inputWrapperFocused]}>
            <TextInput
              style={styles.textInput}
              value={challengeName}
              onChangeText={setChallengeName}
              placeholder="Enter challenge name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Goal Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Goal Amount</Text>
          <View style={[styles.inputWrapper, goalAmount.length > 0 && styles.inputWrapperFocused]}>
            <Text style={styles.currencySymbol}>₱</Text>
            <TextInput
              style={[styles.textInput, styles.amountInput]}
              value={goalAmount}
              onChangeText={(text) => {
                // Only allow numbers and decimal point
                const cleanedText = text.replace(/[^0-9.]/g, '');
                // Ensure only one decimal point
                const parts = cleanedText.split('.');
                if (parts.length > 2) {
                  return;
                }
                setGoalAmount(cleanedText);
              }}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Icon Selector */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Challenge Icon</Text>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowIconPicker(true)}
          >
            <View style={styles.iconPreview}>
              <Ionicons name={selectedIcon} size={24} color={colors.azureRadiance[500]} />
            </View>
            <Text style={styles.iconButtonText}>
              {iconOptions.find(option => option.name === selectedIcon)?.label || 'Select Icon'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Frequency Selector */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Frequency</Text>
          <TouchableOpacity 
            style={styles.frequencyButton}
            onPress={() => setShowFrequencyPicker(true)}
          >
            <Text style={styles.frequencyButtonText}>{frequency}</Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Date to Finish */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Date to Finish</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {dateToFinish ? formatDate(dateToFinish) : "Select Date"}
            </Text>
            <Ionicons name="calendar" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            (!isFormValid || isLoading) && styles.saveButtonDisabled
          ]}
          onPress={handleSaveChallenge}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.saveButtonText}>Updating...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Update Challenge</Text>
          )}
        </TouchableOpacity>

        {/* Computation Card */}
        <View style={styles.computationCard}>
          <View style={styles.computationContent}>
            <View style={styles.computationText}>
              <Text style={styles.computationLabel}>You need to save</Text>
              <View style={styles.amountFrequencyRow}>
                <Text style={styles.estimatedAmount}>
                  {isFormValid && estimatedAmount > 0 ? formatCurrency(estimatedAmount) : '₱0.00'}
                </Text>
                <Text style={styles.computationFrequency}>
                  /{frequency.toLowerCase()}
                </Text>
              </View>
              <Text style={styles.computationGoal}>
                to achieve {goalAmount ? formatCurrency(parseFloat(goalAmount) || 0) : '₱0.00'}
              </Text>
            </View>
            <Image 
              source={require('../../assets/piggy-bank.png')} 
              style={styles.piggyBankImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </ScrollView>

      {/* Frequency Picker Modal */}
      <Modal
        visible={showFrequencyPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFrequencyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Frequency</Text>
            {['Daily', 'Weekly', 'Monthly'].map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyOption,
                  frequency === freq && styles.frequencyOptionSelected
                ]}
                onPress={() => {
                  setFrequency(freq as FrequencyType);
                  setShowFrequencyPicker(false);
                }}
              >
                <Text style={[
                  styles.frequencyOptionText,
                  frequency === freq && styles.frequencyOptionTextSelected
                ]}>
                  {freq}
                </Text>
                {frequency === freq && (
                  <Ionicons name="checkmark" size={20} color={colors.azureRadiance[500]} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowFrequencyPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Icon Picker Modal */}
      <Modal
        visible={showIconPicker}
        transparent={true}
        animationType="none"
        onRequestClose={closeIconPicker}
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
            onPress={closeIconPicker}
          />
          <Animated.View 
            style={[
              styles.iconModalContent,
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
              <Text style={styles.modalTitle}>Select Icon</Text>
              <ScrollView 
                style={styles.iconScrollContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.iconGridContainer}>
                  {iconOptions.map((option) => (
                    <TouchableOpacity
                      key={option.name}
                      style={[
                        styles.iconGridItem,
                        selectedIcon === option.name && styles.iconGridItemSelected
                      ]}
                      onPress={() => {
                        setSelectedIcon(option.name);
                        closeIconPicker();
                      }}
                    >
                      <View style={[
                        styles.iconGridIcon,
                        selectedIcon === option.name && styles.iconGridIconSelected
                      ]}>
                        <Ionicons 
                          name={option.name} 
                          size={24} 
                          color={selectedIcon === option.name ? '#FFFFFF' : colors.azureRadiance[500]} 
                        />
                      </View>
                      <Text style={[
                        styles.iconGridText,
                        selectedIcon === option.name && styles.iconGridTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
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
            <Text style={styles.modalTitle}>Select Date to Finish</Text>
            
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
                        dayObj.date.toDateString() === dateToFinish?.toDateString() && styles.calendarDaySelected
                      ]}
                      onPress={() => {
                        if (!dayObj.isDisabled) {
                          setDateToFinish(dayObj.date);
                          setShowDatePicker(false);
                        }
                      }}
                      disabled={dayObj.isDisabled}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        dayObj.isDisabled && styles.calendarDayTextDisabled,
                        dayObj.date.toDateString() === dateToFinish?.toDateString() && styles.calendarDayTextSelected
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

// Styles (same as AddSavingsChallengeScreen)
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
  inputContainer: {
    marginBottom: 24,
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
  inputWrapperFocused: {
    borderColor: '#6B7280',
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  amountInput: {
    textAlign: 'left',
  },
  frequencyButton: {
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
  frequencyButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  iconButton: {
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
  iconPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.azureRadiance[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconButtonText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
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
  computationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: colors.azureRadiance[500],
  },
  computationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  computationText: {
    flex: 1,
    marginRight: 16,
  },
  computationLabel: {
    fontSize: 14,
    color: colors.azureRadiance[600],
    marginBottom: 4,
  },
  amountFrequencyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  estimatedAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.azureRadiance[700],
    marginRight: 8,
  },
  computationFrequency: {
    fontSize: 16,
    color: colors.azureRadiance[500],
    fontWeight: '500',
  },
  computationGoal: {
    fontSize: 14,
    color: colors.azureRadiance[600],
    lineHeight: 20,
  },
  piggyBankImage: {
    width: 80,
    height: 80,
  },
  saveButton: {
    backgroundColor: colors.azureRadiance[500],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: colors.azureRadiance[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: colors.azureRadiance[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.azureRadiance[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  frequencyOptionSelected: {
    backgroundColor: colors.azureRadiance[50],
  },
  frequencyOptionText: {
    fontSize: 16,
    color: colors.azureRadiance[700],
  },
  frequencyOptionTextSelected: {
    fontWeight: '600',
    color: colors.azureRadiance[600],
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.azureRadiance[100],
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCancelText: {
    fontSize: 16,
    color: colors.azureRadiance[600],
    fontWeight: '600',
  },
  iconModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  iconScrollContainer: {
    maxHeight: 400,
  },
  iconGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  iconGridItem: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconGridItemSelected: {
    backgroundColor: colors.azureRadiance[50],
    borderColor: colors.azureRadiance[500],
  },
  iconGridIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.azureRadiance[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconGridIconSelected: {
    backgroundColor: colors.azureRadiance[500],
  },
  iconGridText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  iconGridTextSelected: {
    color: colors.azureRadiance[700],
    fontWeight: '600',
  },
  dateModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    maxHeight: '80%',
    width: '90%',
  },
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
