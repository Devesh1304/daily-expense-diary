import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LedgerScreen from '../screens/LedgerScreen';
import LedgerDetailScreen from '../screens/LedgerDetailScreen';
import { colors } from '../theme/colors';

const Stack = createStackNavigator();

export default function LedgerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="LedgerList" component={LedgerScreen} />
      <Stack.Screen name="LedgerDetail" component={LedgerDetailScreen} />
    </Stack.Navigator>
  );
}
