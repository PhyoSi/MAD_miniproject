import { Platform } from 'react-native';

const suppressedMessages = [
  'pointerEvents is deprecated',
  'useNativeDriver',
  '"shadow*" style props are deprecated',
];

if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (suppressedMessages.some(item => message.includes(item))) {
      return;
    }
    originalWarn(...args);
  };
}
