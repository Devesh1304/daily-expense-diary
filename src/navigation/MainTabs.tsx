import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import CashScreen from '../screens/CashScreen';
import LedgerStack from './LedgerStack';
import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Transactions: 'create-outline',
  Account: 'swap-horizontal-outline',
};

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const { palette: c } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          paddingTop: 4,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
        sceneContainerStyle: {
          paddingBottom: 0,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={CashScreen} />
      <Tab.Screen name="Account" component={LedgerStack} />
    </Tab.Navigator>
  );
}
