import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LedgerScreen from '../screens/LedgerScreen';
import LedgerDetailScreen from '../screens/LedgerDetailScreen';
import { useTheme } from '../theme/ThemeContext';

const Stack = createStackNavigator();

export default function LedgerStack() {
  const { palette: c } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: c.background } }}>
      <Stack.Screen name="LedgerList" component={LedgerScreen} />
      <Stack.Screen name="LedgerDetail" component={LedgerDetailScreen} />
    </Stack.Navigator>
  );
}
