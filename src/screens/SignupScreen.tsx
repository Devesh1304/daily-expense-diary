import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import StatusBanner from '../components/StatusBanner';
import {
  AuthField,
  getAuthErrorFields,
  getAuthErrorMessage,
  isValidEmail,
  logAuthError,
  withTimeout,
} from '../utils/authErrors';

const MIN_PASSWORD_LENGTH = 6;

export default function SignupScreen({ navigation }: any) {
  const { palette: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorFields, setErrorFields] = useState<AuthField[]>([]);
  const inFlight = useRef(false); // blocks a second submit before React re-renders

  function clearError() {
    setError(null);
    setErrorFields([]);
  }

  function fail(message: string, fields: AuthField[] = []) {
    setError(message);
    setErrorFields(fields);
  }

  async function handleSignup() {
    if (inFlight.current) return;
    clearError();

    if (!email.trim()) return fail('Please enter your email address.', ['email']);
    if (!isValidEmail(email)) return fail("That email address doesn't look right. Please check it.", ['email']);
    if (!password) return fail('Please choose a password.', ['password']);
    if (password.length < MIN_PASSWORD_LENGTH) {
      return fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, ['password']);
    }

    inFlight.current = true;
    setSubmitting(true);
    try {
      await withTimeout(signUp(name, email, password));
      showToast('Account created. Welcome!');
    } catch (e) {
      logAuthError('signup', e);
      fail(getAuthErrorMessage(e), getAuthErrorFields(e));
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  const fieldStyle = (field: AuthField) => [styles.input, errorFields.includes(field) && styles.inputError];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {error !== null && (
        <View style={[styles.bannerWrap, { paddingTop: insets.top + 8 }]}>
          <StatusBanner kind="error" message={error} onDismiss={clearError} />
        </View>
      )}

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>₹</Text>
            </View>
            <Text style={styles.logo}>Daily Expense Diary</Text>
            <Text style={styles.subtitle}>Start your expense diary</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={c.textMuted}
            value={name}
            onChangeText={setName}
            editable={!submitting}
          />
          <TextInput
            style={fieldStyle('email')}
            placeholder="Email"
            placeholderTextColor={c.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (error) clearError();
            }}
            editable={!submitting}
          />
          <TextInput
            style={fieldStyle('password')}
            placeholder="Password"
            placeholderTextColor={c.textMuted}
            secureTextEntry
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (error) clearError();
            }}
            editable={!submitting}
          />

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonBusy]}
            onPress={handleSignup}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting, busy: submitting }}
          >
            {submitting ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.buttonText}>Creating account...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={submitting}>
            <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    bannerWrap: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      backgroundColor: c.background,
      zIndex: 10,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 28,
      paddingVertical: 32,
    },
    logoContainer: { alignItems: 'center', marginBottom: 32 },
    logoCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    logoIcon: { fontSize: 28, fontWeight: '800', color: c.primary },
    logo: {
      fontSize: 26,
      fontWeight: '700',
      textAlign: 'center',
      color: c.text,
      marginBottom: 4,
    },
    subtitle: {
      textAlign: 'center',
      color: c.textMuted,
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      paddingHorizontal: 20,
      paddingVertical: 14,
      fontSize: 16,
      marginBottom: 14,
      backgroundColor: c.surface,
      color: c.text,
    },
    inputError: {
      borderColor: '#DC2626',
      borderWidth: 2,
    },
    button: {
      backgroundColor: c.primary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 8,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonBusy: {
      opacity: 0.8,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    link: {
      textAlign: 'center',
      color: c.textMuted,
      marginTop: 20,
    },
    linkBold: {
      color: c.primary,
      fontWeight: '700',
    },
  });
}
