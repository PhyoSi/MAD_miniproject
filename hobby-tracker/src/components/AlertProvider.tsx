import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Snackbar, Text } from 'react-native-paper';

import { colors } from '@/src/constants/theme';

/* ------------------------------------------------------------------ */
/*  Public API exposed via context                                     */
/* ------------------------------------------------------------------ */
interface AlertAPI {
  showSnackbar: (message: string, type?: 'success' | 'error' | 'info') => void;
  showDialog: (opts: DialogOptions) => Promise<boolean>;
}

interface DialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

const AlertContext = createContext<AlertAPI | null>(null);

export function useAlerts(): AlertAPI {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used inside <AlertProvider>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Singleton reference so non-component code (appAlerts.ts) can call  */
/* ------------------------------------------------------------------ */
let _singletonAPI: AlertAPI | null = null;

export function getAlertAPI(): AlertAPI | null {
  return _singletonAPI;
}

/* ------------------------------------------------------------------ */
/*  Snackbar colour helper                                             */
/* ------------------------------------------------------------------ */
function snackbarBg(type: 'success' | 'error' | 'info'): string {
  switch (type) {
    case 'success':
      return '#065F46'; // emerald-800
    case 'error':
      return '#7F1D1D'; // red-900
    default:
      return colors.surface;
  }
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */
export default function AlertProvider({ children }: { children: React.ReactNode }) {
  /* — snackbar state — */
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackType, setSnackType] = useState<'success' | 'error' | 'info'>('info');

  /* — dialog state — */
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogConfirmLabel, setDialogConfirmLabel] = useState('OK');
  const [dialogCancelLabel, setDialogCancelLabel] = useState('Cancel');
  const [dialogDestructive, setDialogDestructive] = useState(false);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  /* — snackbar handler — */
  const showSnackbar = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setSnackMessage(message);
      setSnackType(type);
      setSnackVisible(true);
    },
    [],
  );

  /* — dialog handler — */
  const showDialog = useCallback((opts: DialogOptions): Promise<boolean> => {
    setDialogTitle(opts.title);
    setDialogMessage(opts.message);
    setDialogConfirmLabel(opts.confirmLabel ?? 'OK');
    setDialogCancelLabel(opts.cancelLabel ?? 'Cancel');
    setDialogDestructive(opts.destructive ?? false);
    setDialogVisible(true);

    return new Promise<boolean>(resolve => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleDialogDismiss = useCallback((result: boolean) => {
    setDialogVisible(false);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  const api = useMemo<AlertAPI>(() => ({ showSnackbar, showDialog }), [showSnackbar, showDialog]);

  // Keep singleton in sync
  _singletonAPI = api;

  return (
    <AlertContext.Provider value={api}>
      {children}

      <Portal>
        {/* ——— Confirmation / info dialog ——— */}
        <Dialog
          visible={dialogVisible}
          onDismiss={() => handleDialogDismiss(false)}
          style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>{dialogTitle}</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogBody}>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {dialogDestructive && (
              <Button
                onPress={() => handleDialogDismiss(false)}
                textColor={colors.textSecondary}>
                {dialogCancelLabel}
              </Button>
            )}
            <Button
              onPress={() => handleDialogDismiss(true)}
              textColor={dialogDestructive ? colors.error : colors.primary}>
              {dialogConfirmLabel}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* ——— Snackbar (outside Portal so it renders at bottom) ——— */}
      <View style={styles.snackbarWrapper} pointerEvents="box-none">
        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={3000}
          style={[styles.snackbar, { backgroundColor: snackbarBg(snackType) }]}
          action={{
            label: 'OK',
            textColor: colors.text,
            onPress: () => setSnackVisible(false),
          }}>
          <Text style={styles.snackText}>{snackMessage}</Text>
        </Snackbar>
      </View>
    </AlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  dialogTitle: {
    color: colors.text,
  },
  dialogBody: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  snackbarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  snackbar: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  snackText: {
    color: colors.text,
  },
});
