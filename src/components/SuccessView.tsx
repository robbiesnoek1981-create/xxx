import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface SuccessViewProps {
  onReset: () => void;
}

export function SuccessView({ onReset }: SuccessViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✅</Text>
      <Text style={styles.title}>Registratie verzonden!</Text>
      <Text style={styles.message}>
        Het korte contact is succesvol geregistreerd en verstuurd naar{' '}
        <Text style={styles.email}>r.snoek@sthelmond.nl</Text>.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onReset}
        accessibilityRole="button"
        accessibilityLabel="Nieuw contact registreren"
      >
        <Text style={styles.buttonText}>Nieuw contact registreren</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  icon: { fontSize: 64, marginBottom: Spacing.lg },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.success,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  email: {
    color: Colors.primary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    minWidth: 220,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
