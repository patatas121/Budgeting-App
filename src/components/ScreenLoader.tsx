import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

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

interface ScreenLoaderProps {
  text?: string;
  size?: 'small' | 'large';
}

export default function ScreenLoader({ text = 'Loading...', size = 'large' }: ScreenLoaderProps) {
  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={size} color={colors.azureRadiance[500]} />
        <Text style={styles.loadingText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 245, 255, 0.95)', // Azure Radiance 50 with opacity
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    minWidth: 160,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: colors.azureRadiance[700],
    textAlign: 'center',
  },
});
