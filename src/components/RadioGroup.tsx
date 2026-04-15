import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface RadioGroupProps<T extends string> {
  options: T[];
  selected: T | null;
  onSelect: (value: T) => void;
  columns?: 1 | 2;
}

export function RadioGroup<T extends string>({
  options,
  selected,
  onSelect,
  columns = 1,
}: RadioGroupProps<T>) {
  return (
    <View
      style={[styles.container, columns === 2 && styles.twoColumns]}
      accessibilityRole="radiogroup"
    >
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              columns === 2 && styles.optionHalf,
              isSelected && styles.optionSelected,
            ]}
            onPress={() => onSelect(option)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={option}
            activeOpacity={0.7}
          >
            <View style={[styles.radioRing, isSelected && styles.radioRingSelected]}>
              {isSelected && <View style={styles.radioDot} />}
            </View>
            <Text
              style={[styles.label, isSelected && styles.labelSelected]}
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
  container: {
    width: '100%',
  },
  twoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    marginVertical: 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 44,
  },
  optionHalf: {
    width: '50%',
  },
  optionSelected: {
    backgroundColor: Colors.selectionFill,
    borderColor: Colors.primary,
  },
  radioRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    flexShrink: 0,
  },
  radioRingSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  labelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
