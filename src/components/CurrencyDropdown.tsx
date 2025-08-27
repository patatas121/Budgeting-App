import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AnimatedView = Animated.createAnimatedComponent(View);

type Currency = {
  code: string;
  symbol: string;
  name: string;
  flag: string;
};

type CurrencyDropdownProps = {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  compact?: boolean;
};

export default function CurrencyDropdown({ selectedCurrency, onCurrencyChange, compact = false }: CurrencyDropdownProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current; // Start 300px below

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (isVisible) {
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
  }, [isVisible, fadeAnim, slideAnim]);

  const fetchCurrencies = async () => {
    try {
      // Using REST Countries API for currency data with flags
      const response = await fetch('https://restcountries.com/v3.1/all?fields=currencies,flag,cca2');
      const countries = await response.json();
      
      const currencyMap = new Map();
      
      countries.forEach((country: any) => {
        if (country.currencies) {
          Object.entries(country.currencies).forEach(([code, currency]: [string, any]) => {
            if (!currencyMap.has(code)) {
              currencyMap.set(code, {
                code,
                symbol: currency.symbol || code,
                name: currency.name,
                flag: country.flag,
              });
            }
          });
        }
      });

      const popularCurrencies = ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
      const sortedCurrencies = Array.from(currencyMap.values())
        .filter((curr: Currency) => popularCurrencies.includes(curr.code))
        .sort((a: Currency, b: Currency) => 
          popularCurrencies.indexOf(a.code) - popularCurrencies.indexOf(b.code)
        );

      setCurrencies(sortedCurrencies);
    } catch (error) {
      // Fallback to static data if API fails
      setCurrencies([
        { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭' },
        { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
        { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
        { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencySelect = (currency: Currency) => {
    onCurrencyChange(currency);
    setIsVisible(false);
  };

  const handleModalClose = () => {
    setIsVisible(false);
  };

  const renderCurrencyItem = ({ item }: { item: Currency }) => (
    <TouchableOpacity
      style={styles.currencyItem}
      onPress={() => handleCurrencySelect(item)}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <View style={styles.currencyInfo}>
        <Text style={styles.currencyCode}>{item.code}</Text>
        <Text style={styles.currencyName}>{item.name}</Text>
      </View>
      <Text style={styles.currencySymbol}>{item.symbol}</Text>
      {selectedCurrency.code === item.code && (
        <Ionicons name="checkmark" size={16} color="#3b82f6" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={compact ? styles.compactDropdown : styles.dropdown} />;
  }

  return (
    <View>
      <TouchableOpacity
        style={compact ? styles.compactDropdown : styles.dropdown}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.flag}>{selectedCurrency.flag}</Text>
        <Text style={compact ? styles.compactCurrency : styles.selectedCurrency}>
          {selectedCurrency.code}
        </Text>
        <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

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
              <Text style={styles.modalTitle}>Select Currency</Text>
              <FlatList
                data={currencies}
                renderItem={renderCurrencyItem}
                keyExtractor={(item) => item.code}
                style={styles.currencyList}
              />
            </AnimatedView>
          </TouchableOpacity>
        </AnimatedView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  compactDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedCurrency: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    marginRight: 4,
  },
  compactCurrency: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 4,
  },
  flag: {
    fontSize: 16,
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
    paddingTop: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  currencyList: {
    paddingHorizontal: 20,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  currencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#6b7280',
  },
});
