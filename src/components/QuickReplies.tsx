import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface QuickReply {
  label: string;
  value: string;
  description?: string;
}

interface Props {
  replies: QuickReply[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function QuickReplies({ replies, onSelect, disabled }: Props) {
  return (
    <View style={styles.container}>
      {replies.map((reply) => (
        <TouchableOpacity
          key={reply.value}
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={() => !disabled && onSelect(reply.value)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={reply.label}
          activeOpacity={0.75}
        >
          <Text style={[styles.label, disabled && styles.labelDisabled]}>
            {reply.label}
          </Text>
          {reply.description && (
            <Text style={[styles.description, disabled && styles.labelDisabled]}>
              {reply.description}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  button: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonDisabled: {
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  label: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.primary,
  },
  labelDisabled: {
    color: Colors.disabled,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
