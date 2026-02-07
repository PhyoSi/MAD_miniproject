import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';

import { colors, fonts } from '@/src/constants/theme';
import { useHobbyStore } from '@/src/store/hobbyStore';
import { validateSessionDate, validateSessionDuration } from '@/src/utils/validation';
import OfflineBanner from '@/src/components/OfflineBanner';
import { toIsoDateString } from '@/src/utils/dateUtils';

const MINUTE_STEPS = [0, 15, 30, 45];

export default function AddSessionScreen() {
  const { hobbyId } = useLocalSearchParams<{ hobbyId?: string }>();
  const { hobbies, addSession, isLoading } = useHobbyStore();
  const [selectedHobbyId, setSelectedHobbyId] = useState<string | null>(hobbyId ?? null);
  const [date, setDate] = useState(new Date());
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (hobbyId) {
      setSelectedHobbyId(hobbyId);
    }
  }, [hobbyId]);

  const durationMinutes = useMemo(() => hours * 60 + minutes, [hours, minutes]);

  const handleSave = async () => {
    if (!selectedHobbyId) {
      Alert.alert('Missing hobby', 'Select a hobby to log a session.');
      return;
    }

    if (!validateSessionDuration(durationMinutes)) {
      Alert.alert('Invalid duration', 'Duration must be between 1 and 1440 minutes.');
      return;
    }

    const isoDate = toIsoDateString(date);
    if (!validateSessionDate(isoDate)) {
      Alert.alert('Invalid date', 'Choose a valid date not in the future.');
      return;
    }

    if (!isOnline) {
      Alert.alert('Offline', 'Connect to the internet to add sessions.');
      return;
    }

    try {
      await addSession(selectedHobbyId, isoDate, durationMinutes);
      Alert.alert('Success', 'Session logged.');
    } catch (error) {
      console.error('Error adding session:', error);
      Alert.alert('Error', 'Failed to log session.');
    }
  };

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} />
      <Text style={styles.title}>Log a session</Text>

      <Text style={styles.sectionLabel}>Choose hobby</Text>
      <FlatList
        data={hobbies}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.hobbyList}
        renderItem={({ item }) => {
          const selected = selectedHobbyId === item.id;
          return (
            <TouchableOpacity
              style={[styles.hobbyItem, selected && styles.hobbyItemSelected]}
              onPress={() => setSelectedHobbyId(item.id)}>
              <Text style={styles.hobbyIcon}>{item.icon}</Text>
              <Text style={styles.hobbyName}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <Text style={styles.sectionLabel}>Date</Text>
      <DateTimePicker
        value={date}
        mode="date"
        maximumDate={new Date()}
        onChange={(_, selectedDate) => setDate(selectedDate ?? date)}
        display={Platform.select({ ios: 'spinner', android: 'default' })}
      />

      <Text style={styles.sectionLabel}>Duration</Text>
      <View style={styles.durationRow}>
        <View style={styles.durationBox}>
          <Text style={styles.durationLabel}>Hours</Text>
          <View style={styles.durationControls}>
            <Button mode="outlined" onPress={() => setHours(Math.max(0, hours - 1))}>-</Button>
            <Text style={styles.durationValue}>{hours}</Text>
            <Button mode="outlined" onPress={() => setHours(Math.min(24, hours + 1))}>+</Button>
          </View>
        </View>
        <View style={styles.durationBox}>
          <Text style={styles.durationLabel}>Minutes</Text>
          <View style={styles.durationControls}>
            {MINUTE_STEPS.map(step => (
              <TouchableOpacity
                key={step}
                style={[styles.minuteChip, minutes === step && styles.minuteChipActive]}
                onPress={() => setMinutes(step)}>
                <Text style={styles.minuteText}>{step}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Button mode="contained" onPress={handleSave} loading={isLoading} style={styles.saveButton}>
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
  title: {
    ...fonts.title,
    color: colors.text,
  },
  sectionLabel: {
    ...fonts.label,
    color: colors.text,
    marginTop: 16,
  },
  hobbyList: {
    gap: 10,
    paddingVertical: 10,
  },
  hobbyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 10,
  },
  hobbyItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  hobbyIcon: {
    fontSize: 22,
  },
  hobbyName: {
    ...fonts.body,
    color: colors.text,
  },
  durationRow: {
    gap: 16,
    marginTop: 12,
  },
  durationBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationLabel: {
    ...fonts.caption,
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  durationValue: {
    ...fonts.heading,
    color: colors.text,
  },
  minuteChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  minuteChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  minuteText: {
    ...fonts.body,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
  },
});
