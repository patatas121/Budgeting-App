import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AnimatedView = Animated.createAnimatedComponent(View);
const { height: screenHeight } = Dimensions.get('window');

type Category = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

type CategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (category: Category) => void;
  type: 'income' | 'expense';
  selectedCategory?: Category;
};

const expenseCategories: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'restaurant', color: '#ef4444' },
  { id: '2', name: 'Transportation', icon: 'car', color: '#f97316' },
  { id: '3', name: 'Shopping', icon: 'bag', color: '#ec4899' },
  { id: '4', name: 'Entertainment', icon: 'game-controller', color: '#8b5cf6' },
  { id: '5', name: 'Bills & Utilities', icon: 'receipt', color: '#06b6d4' },
  { id: '6', name: 'Healthcare', icon: 'medical', color: '#10b981' },
  { id: '7', name: 'Education', icon: 'school', color: '#3b82f6' },
  { id: '8', name: 'Travel', icon: 'airplane', color: '#f59e0b' },
  { id: '9', name: 'Groceries', icon: 'basket', color: '#84cc16' },
  { id: '10', name: 'Gas & Fuel', icon: 'car-sport', color: '#ef4444' },
  { id: '11', name: 'Home & Garden', icon: 'home', color: '#22c55e' },
  { id: '12', name: 'Personal Care', icon: 'cut', color: '#ec4899' },
  { id: '13', name: 'Insurance', icon: 'shield-checkmark', color: '#3b82f6' },
  { id: '14', name: 'Taxes', icon: 'document-text', color: '#6b7280' },
  { id: '15', name: 'Phone & Internet', icon: 'phone-portrait', color: '#06b6d4' },
  { id: '16', name: 'Subscriptions', icon: 'card', color: '#8b5cf6' },
  { id: '17', name: 'Gifts & Donations', icon: 'gift', color: '#f43f5e' },
  { id: '18', name: 'Clothing', icon: 'shirt', color: '#ec4899' },
  { id: '19', name: 'Electronics', icon: 'phone-portrait', color: '#6366f1' },
  { id: '20', name: 'Books & Media', icon: 'library', color: '#8b5cf6' },
  { id: '21', name: 'Sports & Fitness', icon: 'fitness', color: '#f97316' },
  { id: '22', name: 'Pet Care', icon: 'paw', color: '#84cc16' },
  { id: '23', name: 'Baby & Kids', icon: 'happy', color: '#f472b6' },
  { id: '24', name: 'Rent & Mortgage', icon: 'business', color: '#0891b2' },
  { id: '25', name: 'Repairs & Maintenance', icon: 'construct', color: '#f97316' },
  { id: '26', name: 'Bank Fees', icon: 'card', color: '#6b7280' },
  { id: '27', name: 'Office Supplies', icon: 'briefcase', color: '#3b82f6' },
  { id: '28', name: 'Parking & Tolls', icon: 'car', color: '#f59e0b' },
  { id: '29', name: 'Coffee & Tea', icon: 'cafe', color: '#92400e' },
  { id: '30', name: 'Alcohol & Bars', icon: 'wine', color: '#dc2626' },
  { id: '31', name: 'Fast Food', icon: 'fast-food', color: '#ea580c' },
  { id: '32', name: 'Pharmacy', icon: 'medical', color: '#059669' },
  { id: '33', name: 'Laundry', icon: 'shirt', color: '#0284c7' },
  { id: '34', name: 'Hair & Beauty', icon: 'cut', color: '#e11d48' },
  { id: '35', name: 'Dental Care', icon: 'medical', color: '#0d9488' },
  { id: '36', name: 'Eye Care', icon: 'eye', color: '#7c3aed' },
  { id: '37', name: 'Massage & Spa', icon: 'flower', color: '#db2777' },
  { id: '38', name: 'Hobbies', icon: 'color-palette', color: '#7c2d12' },
  { id: '39', name: 'Uncategorized', icon: 'help-circle', color: '#6b7280' },
  { id: '40', name: 'Others', icon: 'ellipsis-horizontal', color: '#6b7280' },
];

const incomeCategories: Category[] = [
  { id: '1', name: 'Salary', icon: 'card', color: '#10b981' },
  { id: '2', name: 'Freelance', icon: 'laptop', color: '#3b82f6' },
  { id: '3', name: 'Business', icon: 'briefcase', color: '#f59e0b' },
  { id: '4', name: 'Investment', icon: 'trending-up', color: '#8b5cf6' },
  { id: '5', name: 'Rental Income', icon: 'home', color: '#06b6d4' },
  { id: '6', name: 'Dividends', icon: 'stats-chart', color: '#10b981' },
  { id: '7', name: 'Interest', icon: 'calculator', color: '#3b82f6' },
  { id: '8', name: 'Bonus', icon: 'star', color: '#f59e0b' },
  { id: '9', name: 'Gift Money', icon: 'gift', color: '#ec4899' },
  { id: '10', name: 'Refund', icon: 'return-up-back', color: '#22c55e' },
  { id: '11', name: 'Side Hustle', icon: 'cash', color: '#f97316' },
  { id: '12', name: 'Uncategorized', icon: 'help-circle', color: '#6b7280' },
  { id: '13', name: 'Others', icon: 'ellipsis-horizontal', color: '#6b7280' },
];

export default function CategoryModal({ visible, onClose, onSelectCategory, type, selectedCategory }: CategoryModalProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(400)).current; // Start 400px below screen
  const heightAnim = useRef(new Animated.Value(0.3)).current; // Start at 30%
  const dragY = useRef(new Animated.Value(0)).current;

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  // Pan responder for drag gesture
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    onPanResponderGrant: () => {
      // @ts-ignore - accessing private property for offset functionality
      dragY.setOffset(dragY._value);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Limit the drag movement to prevent modal from going off-screen
      const newValue = Math.max(-100, Math.min(100, gestureState.dy));
      dragY.setValue(newValue);
    },
    onPanResponderRelease: (evt, gestureState) => {
      dragY.flattenOffset();
      
      const threshold = 30; // 30 pixels threshold
      
      if (gestureState.dy < -threshold && !isExpanded) {
        // Dragged up enough to expand
        expandModal();
      } else if (gestureState.dy > threshold && isExpanded) {
        // Dragged down enough to collapse
        collapseModal();
      } else {
        // Reset to current state
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const expandModal = () => {
    setIsExpanded(true);
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: 0.75,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.spring(dragY, {
        toValue: 0,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const collapseModal = () => {
    setIsExpanded(false);
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.spring(dragY, {
        toValue: 0,
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      setIsExpanded(false); // Reset to collapsed state when modal opens
      heightAnim.setValue(0.3); // Reset height to 30%
      dragY.setValue(0); // Reset drag position
      dragY.setOffset(0); // Reset offset as well
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setModalVisible(false);
        setIsExpanded(false);
        dragY.setValue(0);
        dragY.setOffset(0);
      });
    }
  }, [visible, fadeAnim, slideAnim, heightAnim, dragY]);

  const handleCategorySelect = (category: Category) => {
    onSelectCategory(category);
    onClose();
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory?.id === item.id && styles.selectedCategory
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color="white" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      {selectedCategory?.id === item.id && (
        <Ionicons name="checkmark-circle" size={20} color="#3b82f6" style={styles.checkmark} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <AnimatedView style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.modalOverlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        >
          <AnimatedView
            style={[
              styles.modalContent,
              { 
                transform: [
                  { 
                    translateY: Animated.add(
                      slideAnim,
                      dragY.interpolate({
                        inputRange: [-100, 0, 100],
                        outputRange: [-10, 0, 10],
                        extrapolate: 'clamp'
                      })
                    )
                  }
                ],
                height: heightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['20%', '100%'],
                }),
              }
            ]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => {}}
          >
            <View style={styles.modalHeader}>
              <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
                <View style={styles.dragHandle} />
                <Text style={styles.dragHint}>
                  {isExpanded ? 'Pull down to collapse' : 'Pull up to expand'}
                </Text>
              </View>
              <Text style={styles.modalTitle}>
                Select {type === 'expense' ? 'Expense' : 'Income'} Category
              </Text>
            </View>
            
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              style={styles.categoriesList}
              showsVerticalScrollIndicator={false}
            />
            </AnimatedView>
        </TouchableOpacity>
      </AnimatedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    minHeight: 50,
    width: '100%',
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#d1d5db',
    borderRadius: 3,
    marginBottom: 8,
  },
  dragHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    margin: 6,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategory: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#374151',
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export { type Category };
