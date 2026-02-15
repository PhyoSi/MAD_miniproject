import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, fonts } from '@/src/constants/theme';

interface SectionLabelProps {
  children: string;
  style?: any;
}

export default function SectionLabel({ children, style }: SectionLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...fonts.label,
    color: colors.text,
    marginTop: 16,
  },
});