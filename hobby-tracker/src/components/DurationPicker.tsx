import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { colors, fonts } from '@/src/constants/theme';

interface DurationPickerProps {
  hours: number;
  minutes: number;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
  label?: string;
  minuteSteps?: number[];
  maxHours?: number;
}

export default function DurationPicker({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  label = 'Duration',
  minuteSteps = [0, 15, 30, 45],
  maxHours = 24,
}: DurationPickerProps) {
  const handleHoursDecrement = () => {
    onHoursChange(Math.max(0, hours - 1));
  };

  const handleHoursIncrement = () => {
    onHoursChange(Math.min(maxHours, hours + 1));
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.container}>
        {/* Hours Picker */}
        <View style={styles.box}>
          <Text style={styles.boxLabel}>Hours</Text>
          <View style={styles.controls}>
            <Button 
              mode="outlined" 
              onPress={handleHoursDecrement}
              disabled={hours === 0}
              accessibilityLabel="Decrease hours"
              accessibilityHint={`Current value: ${hours} hours`}>
              -
            </Button>
            <Text style={styles.value}>{hours}</Text>
            <Button 
              mode="outlined" 
              onPress={handleHoursIncrement}
              disabled={hours === maxHours}
              accessibilityLabel="Increase hours"
              accessibilityHint={`Current value: ${hours} hours`}>
              +
            </Button>
          </View>
        </View>

        {/* Minutes Picker */}
        <View style={styles.box}>
          <Text style={styles.boxLabel}>Minutes</Text>
          <View style={styles.controls}>
            {minuteSteps.map(step => (
              <TouchableOpacity
                key={step}
                style={[styles.chip, minutes === step && styles.chipActive]}
                onPress={() => onMinutesChange(step)}
                accessibilityRole="radio"
                accessibilityState={{ selected: minutes === step }}
                accessibilityLabel={`${step} minutes`}>
                <Text style={styles.chipText}>{step}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...fonts.label,
    color: colors.text,
    marginTop: 16,
  },
  container: {
    gap: 16,
    marginTop: 12,
  },
  box: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  boxLabel: {
    ...fonts.caption,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  value: {
    ...fonts.heading,
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  chipText: {
    ...fonts.body,
  },
});