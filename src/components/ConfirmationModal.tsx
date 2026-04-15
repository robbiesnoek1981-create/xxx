import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';

interface ConfirmationModalProps {
  visible: boolean;
  emailBody: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ConfirmationModal({
  visible,
  emailBody,
  onConfirm,
  onCancel,
  isSubmitting,
}: ConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.card}>
            <Text style={styles.title}>Is alles correct ingevuld?</Text>
            <ScrollView
              style={styles.bodyScroll}
              contentContainerStyle={styles.bodyContent}
            >
              <Text style={styles.body}>{emailBody}</Text>
            </ScrollView>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={onCancel}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Annuleren, ga terug"
              >
                <Text style={styles.btnCancelText}>Annuleren</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.btnConfirm,
                  isSubmitting && styles.btnDisabled,
                ]}
                onPress={onConfirm}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Bevestigen en verzenden"
              >
                <Text style={styles.btnConfirmText}>
                  {isSubmitting ? 'Bezig...' : 'Versturen'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  safeArea: { width: '100%' },
  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    maxHeight: '80%',
    ...Shadow.card,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  bodyScroll: {
    maxHeight: 280,
    marginBottom: Spacing.md,
  },
  bodyContent: { paddingBottom: Spacing.sm },
  body: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontFamily: 'monospace',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnConfirm: {
    backgroundColor: Colors.primary,
  },
  btnDisabled: {
    backgroundColor: Colors.disabled,
  },
  btnCancelText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  btnConfirmText: {
    fontSize: FontSize.md,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
