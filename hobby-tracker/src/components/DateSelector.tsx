import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fonts } from '@/src/constants/theme';
import { toIsoDateString } from '@/src/utils/dateUtils';

interface DateSelectorProps {
  date: Date;
  dateInput: string;
  onDateChange: (date: Date) => void;
  onDateInputChange: (dateStr: string) => void;
  label?: string;
}

export default function DateSelector({
  date,
  dateInput,
  onDateChange,
  onDateInputChange,
  label = 'Date',
}: DateSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const isWeb = Platform.OS === 'web';

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) {
      onDateChange(selectedDate);
      onDateInputChange(toIsoDateString(selectedDate));
    }
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {isWeb ? (
        <TextInput
          mode="outlined"
          placeholder="YYYY-MM-DD"
          value={dateInput}
          onChangeText={onDateInputChange}
          style={styles.input}
          accessibilityLabel="Date input"
          accessibilityHint="Enter date in YYYY-MM-DD format"
        />
      ) : (
        <View>
          <Button 
            mode="outlined" 
            onPress={() => setShowPicker(true)}
            accessibilityLabel="Select date"
            accessibilityHint="Opens date picker">
            {toIsoDateString(date)}
          </Button>
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              maximumDate={new Date()}
              onChange={handleDateChange}
              display={Platform.select({ ios: 'spinner', android: 'default' })}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...fonts.label,
    color: colors.text,
    marginTop: 16,
  },
  input: {
    marginTop: 8,
    backgroundColor: colors.surface,
  },
});