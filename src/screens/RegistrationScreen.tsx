import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useFormState } from '../hooks/useFormState';
import { sendRegistration } from '../services/emailService';
import { RadioGroup } from '../components/RadioGroup';
import { CheckboxGroup } from '../components/CheckboxGroup';
import { SectionHeader } from '../components/SectionHeader';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { SuccessView } from '../components/SuccessView';

import {
  WIJK_OPTIONS,
  DOELGROEP_OPTIONS,
  LEEFDOMEIN_OPTIONS,
  KORT_CONTACT_MET_OPTIONS,
} from '../constants/formOptions';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../constants/theme';

export function RegistrationScreen() {
  const {
    form,
    validation,
    emailBody,
    isSubmitting,
    setIsSubmitting,
    showConfirmation,
    setShowConfirmation,
    showSuccess,
    setShowSuccess,
    setWijk,
    setDoelgroep,
    setKortContactMet,
    toggleLeefdomein,
    resetForm,
  } = useFormState();

  const scrollRef = useRef<ScrollView>(null);

  const handleSubmitPress = () => {
    if (!validation.isValid) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const result = await sendRegistration(emailBody);
      setShowConfirmation(false);
      setIsSubmitting(false);

      if (result.success) {
        setShowSuccess(true);
      } else if (result.method === 'mailcomposer' && result.reason === 'unavailable') {
        Alert.alert(
          'Kan niet verzenden',
          'Er is geen mail-app beschikbaar op dit apparaat. Configureer een mail-account en probeer opnieuw.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Verzending mislukt',
          'Het versturen is mislukt. Controleer uw internetverbinding en probeer opnieuw.',
          [
            { text: 'Probeer opnieuw', onPress: () => setShowConfirmation(true) },
            { text: 'Annuleren', style: 'cancel' },
          ]
        );
      }
    } catch {
      setIsSubmitting(false);
      setShowConfirmation(false);
      Alert.alert('Fout', 'Er is een onverwachte fout opgetreden.');
    }
  };

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Korte Contacten</Text>
          <Text style={styles.headerSubtitle}>Registratie</Text>
        </View>
        <SuccessView onReset={resetForm} />
      </SafeAreaView>
    );
  }

  const { errors } = validation;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Korte Contacten</Text>
        <Text style={styles.headerSubtitle}>Registratie</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <SectionHeader title="Wijk" required error={errors.wijk} />
          <RadioGroup
            options={WIJK_OPTIONS}
            selected={form.wijk}
            onSelect={setWijk}
            columns={2}
          />
        </View>

        <View style={styles.card}>
          <SectionHeader title="Doelgroep" required error={errors.doelgroep} />
          <RadioGroup
            options={DOELGROEP_OPTIONS}
            selected={form.doelgroep}
            onSelect={setDoelgroep}
          />
        </View>

        <View style={styles.card}>
          <SectionHeader
            title="Leefdomeinen"
            required
            error={errors.leefdomeinen}
          />
          <Text style={styles.hint}>Meerdere keuzes mogelijk</Text>
          <CheckboxGroup
            options={LEEFDOMEIN_OPTIONS}
            selected={form.leefdomeinen}
            onToggle={toggleLeefdomein}
          />
        </View>

        <View style={styles.card}>
          <SectionHeader
            title="Kort contact met"
            required
            error={errors.kortContactMet}
          />
          <RadioGroup
            options={KORT_CONTACT_MET_OPTIONS}
            selected={form.kortContactMet}
            onSelect={setKortContactMet}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !validation.isValid && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitPress}
          accessibilityRole="button"
          accessibilityLabel="Registratie versturen"
          accessibilityHint={
            !validation.isValid
              ? 'Vul alle verplichte velden in om te verzenden'
              : 'Opent bevestigingsdialoog'
          }
        >
          <Text style={styles.submitButtonText}>Versturen</Text>
        </TouchableOpacity>

        <Text style={styles.privacyText}>
          Deze registratie wordt per e-mail verstuurd naar r.snoek@sthelmond.nl.
          Er worden geen gegevens opgeslagen op dit apparaat of gedeeld met derden.
        </Text>

        <View style={{ height: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg }} />
      </ScrollView>

      <ConfirmationModal
        visible={showConfirmation}
        emailBody={emailBody}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmation(false)}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.md,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.card,
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadow.card,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  privacyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
});
