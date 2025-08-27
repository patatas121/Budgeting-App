import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LendingScreen from '../screens/LendingScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import SavingsScreen from '../screens/SavingsScreen';
import AddSavingsChallengeScreen from '../screens/AddSavingsChallengeScreen';
import SavingsChallengeDetailScreen from '../screens/SavingsChallengeDetailScreen';
import EditSavingsChallengeScreen from '../screens/EditSavingsChallengeScreen';
import CustomTabBar from '../components/CustomTabBar';
import { ChallengesProvider } from '../context/ChallengesContext';
import { View } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#3b82f6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          switch (route.name) {
            case 'DashboardTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'HistoryTab':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'LendingTab':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'SettingsTab':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'home';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
      {/* Placeholder tab for add button */}
      <Tab.Screen
        name="AddPlaceholder"
        component={View}
        options={{ 
          tabBarButton: () => null,
          headerShown: false 
        }}
      />
      <Tab.Screen
        name="LendingTab"
        component={LendingScreen}
        options={{ title: 'Lending' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <ChallengesProvider>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{ title: 'Add Transaction' }}
        />
        <Stack.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Savings"
          component={SavingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddSavingsChallenge"
          component={AddSavingsChallengeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SavingsChallengeDetail"
          component={SavingsChallengeDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditSavingsChallenge"
          component={EditSavingsChallengeScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </ChallengesProvider>
  );
}
