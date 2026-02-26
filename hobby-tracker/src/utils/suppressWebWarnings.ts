import { Platform } from 'react-native';

/* ------------------------------------------------------------------ */
/*  Messages suppressed on ALL platforms                               */
/* ------------------------------------------------------------------ */
const globalSuppressed = [
  'transport errored',           // Firestore WebChannel transient reconnect noise
];

const globalShouldSuppress = (message: string) =>
  globalSuppressed.some(item => message.includes(item));

// Suppress noisy Firestore transport warnings on every platform
const _origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (globalShouldSuppress(msg)) return;
  _origWarn(...args);
};

/* ------------------------------------------------------------------ */
/*  Messages suppressed only on web                                    */
/* ------------------------------------------------------------------ */
const suppressedMessages = [
  'pointerEvents is deprecated',
  'useNativeDriver',
  '"shadow*" style props are deprecated',
  'Cannot record touch end without a touch start',
];

if (Platform.OS === 'web') {
  const originalWarn = console.warn;   // already patched above
  const originalError = console.error;

  const shouldSuppress = (message: string) =>
    suppressedMessages.some(item => message.includes(item));

  console.warn = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (shouldSuppress(message)) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (shouldSuppress(message)) {
      return;
    }
    originalError(...args);
  };
}
