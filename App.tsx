import React, { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { TransactionsProvider } from './src/context/TransactionsContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainTabs from './src/navigation/MainTabs';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function Root() {
  const { user, authLoading } = useAuth();
  const { palette: c, scheme } = useTheme();

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: c.background,
        card: c.surface,
        text: c.text,
        border: c.border,
        primary: c.primary,
      },
    };
  }, [c, scheme]);

  if (authLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? (
        <TransactionsProvider>
          <MainTabs />
        </TransactionsProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

function ThemedStatusBar() {
  const { scheme } = useTheme();
  return <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <Root />
            <ThemedStatusBar />
          </AuthProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
