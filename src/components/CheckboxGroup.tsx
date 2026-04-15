import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface CheckboxGroupProps<T extends string> {
  options: T[];
  selected: Set<T>;
  onToggle: (value: T) => void;
}

export function CheckboxGroup<T extends string>({
  options,
  selected,
  onToggle,
}: CheckboxGroupProps<T>) {
  return (
    <View style={styles.grid} accessibilityRole="list">
      {options.map((option) => {
        const isChecked = selected.has(option);
        return (
          <TouchableOpacity
            key={option}
            style={[styles.item, isChecked && styles.itemChecked]}
            onPress={() => onToggle(option)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked }}
            accessibilityLabel={option}
            activeOpacity={0.7}
          >
            <View style={[styles.box, isChecked && styles.boxChecked]}>
              {isChecked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[styles.label, isChecked && styles.labelChecked]}
              numberOfLines={2}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginVertical: 3,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 44,
  },
  itemChecked: {
    backgroundColor: Colors.selectionFill,
    borderColor: Colors.primary,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    flexShrink: 0,
    backgroundColor: Colors.surface,
  },
  boxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  label: {
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  labelChecked: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
