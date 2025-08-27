import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Modal, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current; // Start 300px below

  useEffect(() => {
    if (isModalVisible) {
      setModalVisible(true);
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
          toValue: 300,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [isModalVisible, fadeAnim, slideAnim]);

    function handleTransactionType(type: 'income' | 'expense'): void {
        setIsModalVisible(false);
        navigation.navigate('AddTransaction', { transactionType: type });
    }

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Skip middle tab for add button
          if (index === Math.floor(state.routes.length / 2)) {
            return <View key={route.key} style={styles.placeholderTab} />;
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? '#3b82f6' : '#6b7280',
                size: 24
              })}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Transaction Type Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={handleModalClose}
      >
        <AnimatedView
          style={[styles.modalOverlay, { opacity: fadeAnim }]}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={handleModalClose}
          >
            <AnimatedView 
              style={[
                styles.modalContent, 
                { 
                  transform: [{ translateY: slideAnim }] 
                }
              ]}
            >
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleTransactionType('income')}
              >
                <Ionicons name="arrow-down" size={24} color="#10b981" />
                <Text style={styles.modalButtonText}>Money In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleTransactionType('expense')}
              >
                <Ionicons name="arrow-up" size={24} color="#ef4444" />
                <Text style={styles.modalButtonText}>Money Out</Text>
              </TouchableOpacity>
            </AnimatedView>
          </TouchableOpacity>
        </AnimatedView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    position: 'relative',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 78,
    height: 78,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 4,
    alignSelf: 'center',
    elevation: 6,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
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
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalButtonText: {
    fontSize: 16,
    marginLeft: 12,
  },
  placeholderTab: {
    flex: 1,
  },
});
