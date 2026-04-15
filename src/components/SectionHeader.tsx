import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  required?: boolean;
  error?: string;
}

export function SectionHeader({ title, required, error }: SectionHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  required: {
    fontSize: FontSize.lg,
    color: Colors.error,
    fontWeight: '700',
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginTop: 2,
  },
});
