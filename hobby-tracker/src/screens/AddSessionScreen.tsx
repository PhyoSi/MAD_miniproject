import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

import {
  DateSelector,
  DurationPicker,
  HobbySelector,
  OfflineBanner,
  ScreenTitleBlock,
} from '@/src/components';
import { colors } from '@/src/constants/theme';
import { useOnlineStatus } from '@/src/hooks/use-online-status';
import { useHobbyStore } from '@/src/store/hobbyStore';
import { validateSessionDate, validateSessionDuration } from '@/src/utils/validation';
import { showMessage } from '@/src/utils/appAlerts';
import { toIsoDateString } from '@/src/utils/dateUtils';

export default function AddSessionScreen() {
  const { hobbyId } = useLocalSearchParams<{ hobbyId?: string }>();
  const { hobbies, addSession, isLoading } = useHobbyStore();
  
  // State
  const [selectedHobbyId, setSelectedHobbyId] = useState<string | null>(hobbyId ?? null);
  const [date, setDate] = useState(new Date());
  const [dateInput, setDateInput] = useState(() => toIsoDateString(new Date()));
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const isOnline = useOnlineStatus();

  // Pre-select hobby if passed via params
  useEffect(() => {
    if (hobbyId) {
      setSelectedHobbyId(hobbyId);
    }
  }, [hobbyId]);

  const durationMinutes = useMemo(() => hours * 60 + minutes, [hours, minutes]);

  const handleSave = async () => {
    // Validation
    if (!selectedHobbyId) {
      await showMessage('Missing hobby', 'Select a hobby to log a session.');
      return;
    }

    if (!validateSessionDuration(durationMinutes)) {
      await showMessage('Invalid duration', 'Duration must be between 1 and 1440 minutes.');
      return;
    }

    const isoDate = dateInput;
    if (!validateSessionDate(isoDate)) {
      await showMessage('Invalid date', 'Choose a valid date not in the future.');
      return;
    }

    if (!isOnline) {
      await showMessage('Offline', 'Connect to the internet to add sessions.');
      return;
    }

    // Save session
    try {
      await addSession(selectedHobbyId, isoDate, durationMinutes);
      await showMessage('Success', 'Session logged.');
    } catch (error) {
      console.error('Error adding session:', error);
      await showMessage('Error', 'Failed to log session.');
    }
  };

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} />

      <ScreenTitleBlock title="Log a session" />

      <HobbySelector
        hobbies={hobbies}
        selectedHobbyId={selectedHobbyId}
        onSelectHobby={setSelectedHobbyId}
      />

      <DateSelector
        date={date}
        dateInput={dateInput}
        onDateChange={setDate}
        onDateInputChange={setDateInput}
      />

      <DurationPicker
        hours={hours}
        minutes={minutes}
        onHoursChange={setHours}
        onMinutesChange={setMinutes}
      />

      <Button 
        mode="contained" 
        onPress={handleSave} 
        loading={isLoading} 
        style={styles.saveButton}
        disabled={!isOnline}>
        Save Session
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
  },
});