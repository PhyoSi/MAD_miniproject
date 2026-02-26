import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, fonts } from '@/src/constants/theme';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface WebCalendarPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  maxDate?: Date;
}

export default function WebCalendarPicker({
  selectedDate,
  onSelectDate,
  maxDate,
}: WebCalendarPickerProps) {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const effectiveMax = maxDate ?? today;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    return cells;
  }, [viewYear, viewMonth]);

  const selectedIso = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const firstOfNext = new Date(nextYear, nextMonth, 1);
    if (firstOfNext > effectiveMax) return;
    setViewMonth(nextMonth);
    setViewYear(nextYear);
  };

  const canGoNext = (() => {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    return new Date(nextYear, nextMonth, 1) <= effectiveMax;
  })();

  const handleDayPress = (day: number) => {
    const picked = new Date(viewYear, viewMonth, day);
    if (picked > effectiveMax) return;
    onSelectDate(picked);
  };

  return (
    <View style={styles.container}>
      {/* Month/Year header with nav arrows */}
      <View style={styles.header}>
        <Pressable
          onPress={handlePrevMonth}
          style={styles.navButton}
          accessibilityLabel="Previous month"
          accessibilityRole="button">
          <Text style={styles.navText}>◀</Text>
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <Pressable
          onPress={handleNextMonth}
          style={[styles.navButton, !canGoNext && styles.navDisabled]}
          disabled={!canGoNext}
          accessibilityLabel="Next month"
          accessibilityRole="button">
          <Text style={[styles.navText, !canGoNext && styles.navTextDisabled]}>▶</Text>
        </Pressable>
      </View>

      {/* Day-of-week labels */}
      <View style={styles.weekRow}>
        {DAY_LABELS.map(label => (
          <View key={label} style={styles.dayCell}>
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const cellDate = new Date(viewYear, viewMonth, day);
          const cellIso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = cellIso === selectedIso;
          const isToday = cellDate.getTime() === today.getTime();
          const isFuture = cellDate > effectiveMax;

          return (
            <View key={`day-${day}`} style={styles.dayCell}>
              <Pressable
                onPress={() => handleDayPress(day)}
                disabled={isFuture}
                style={[
                  styles.dayButton,
                  isSelected && styles.dayButtonSelected,
                  isToday && !isSelected && styles.dayButtonToday,
                ]}
                accessibilityLabel={`${MONTH_NAMES[viewMonth]} ${day}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected, disabled: isFuture }}>
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.dayTextSelected,
                    isFuture && styles.dayTextDisabled,
                  ]}>
                  {day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  navDisabled: {
    opacity: 0.3,
  },
  navText: {
    fontSize: 16,
    color: colors.primary,
  },
  navTextDisabled: {
    color: colors.textSecondary,
  },
  monthLabel: {
    ...fonts.label,
    color: colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dayLabel: {
    ...fonts.caption,
    fontSize: 12,
    textAlign: 'center',
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
  },
  dayButtonToday: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayText: {
    ...fonts.body,
    fontSize: 14,
    color: colors.text,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: colors.textSecondary,
    opacity: 0.4,
  },
});
