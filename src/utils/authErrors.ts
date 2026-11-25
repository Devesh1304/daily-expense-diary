export type AuthField = 'email' | 'password';

export const AUTH_TIMEOUT_MS = 20000;
export const FALLBACK_AUTH_MESSAGE = 'Something went wrong. Please try again.';

const CREDENTIAL_MESSAGE = 'Email or password is incorrect. Please try again.';

// Firebase error code -> message shown to the user. Unknown codes use the fallback.
const MESSAGES: Record<string, string> = {
  'auth/invalid-email': "That email address doesn't look right. Please check it.",
  'auth/missing-email': 'Please enter your email address.',
  'auth/missing-password': 'Please enter your password.',
  'auth/invalid-credential': CREDENTIAL_MESSAGE,
  'auth/invalid-login-credentials': CREDENTIAL_MESSAGE,
  'auth/wrong-password': CREDENTIAL_MESSAGE,
  'auth/user-not-found': CREDENTIAL_MESSAGE,
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'No internet connection. Check your network and try again.',
  'auth/operation-not-allowed': 'Email sign-in is not enabled. Please contact support.',
  'auth/internal-error': 'Server error. Please try again in a moment.',
  'auth/timeout': 'The request took too long. Check your connection and try again.',
};

// Which form fields to highlight for each error code.
const FIELDS: Record<string, AuthField[]> = {
  'auth/invalid-email': ['email'],
  'auth/missing-email': ['email'],
  'auth/email-already-in-use': ['email'],
  'auth/missing-password': ['password'],
  'auth/weak-password': ['password'],
  'auth/invalid-credential': ['email', 'password'],
  'auth/invalid-login-credentials': ['email', 'password'],
  'auth/wrong-password': ['email', 'password'],
  'auth/user-not-found': ['email', 'password'],
};

export function getAuthErrorCode(err: unknown): string | null {
  if (err && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string') {
    return (err as { code: string }).code;
  }
  return null;
}

export function getAuthErrorMessage(err: unknown): string {
  const code = getAuthErrorCode(err);
  return (code && MESSAGES[code]) || FALLBACK_AUTH_MESSAGE;
}

export function getAuthErrorFields(err: unknown): AuthField[] {
  const code = getAuthErrorCode(err);
  return (code && FIELDS[code]) || [];
}

// Developer-only trace. Nothing is logged in release builds.
export function logAuthError(context: string, err: unknown) {
  if (!__DEV__) return;
  const code = getAuthErrorCode(err);
  const message = err instanceof Error ? err.message : String(err);
  console.warn('[auth]', {
    context,
    code: code ?? 'unknown',
    message,
    shownToUser: getAuthErrorMessage(err),
  });
}

// Rejects if the request does not finish in time, so the spinner never runs forever.
export function withTimeout<T>(promise: Promise<T>, ms: number = AUTH_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject({ code: 'auth/timeout', message: 'Request timed out' }), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
