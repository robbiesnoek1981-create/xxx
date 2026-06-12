import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThermostatData } from '../../types/dashboard';
import { colors, typography } from './dashboardTheme';

interface Props {
  data: ThermostatData;
  onTargetChange: (delta: number) => void;
  onModeChange: (mode: ThermostatData['mode']) => void;
}

const MODES: { key: ThermostatData['mode']; label: string; icon: string }[] = [
  { key: 'heat', label: 'Verwarmen', icon: '🔥' },
  { key: 'cool', label: 'Koelen', icon: '❄️' },
  { key: 'auto', label: 'Auto', icon: '⚡' },
  { key: 'off', label: 'Uit', icon: '⭕' },
];

export function ThermostatWidget({ data, onTargetChange, onModeChange }: Props) {
  const tempDiff = data.targetTemp - data.currentTemp;
  const statusColor = data.mode === 'off'
    ? colors.textMuted
    : data.isHeating
      ? colors.accentAmber
      : colors.accentGreen;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌡️ Thermostaat</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>

      <View style={styles.tempSection}>
        <View style={styles.currentTempBlock}>
          <Text style={styles.tempSmallLabel}>Huidig</Text>
          <View style={styles.tempRow}>
            <Text style={styles.currentTemp}>{data.currentTemp.toFixed(1)}</Text>
            <Text style={styles.tempUnit}>°C</Text>
          </View>
          {data.isHeating && data.mode !== 'off' && (
            <Text style={styles.heatingLabel}>● Aan het verwarmen</Text>
          )}
        </View>

        <View style={styles.dividerVertical} />

        <View style={styles.targetTempBlock}>
          <Text style={styles.tempSmallLabel}>Ingesteld</Text>
          <View style={styles.targetControls}>
            <TouchableOpacity
              style={styles.tempBtn}
              onPress={() => onTargetChange(-0.5)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.tempBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.targetTempRow}>
              <Text style={styles.targetTemp}>{data.targetTemp.toFixed(1)}</Text>
              <Text style={styles.tempUnit}>°C</Text>
            </View>
            <TouchableOpacity
              style={styles.tempBtn}
              onPress={() => onTargetChange(0.5)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.tempBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.humidityRow}>
        <Text style={styles.humidityLabel}>💧 Luchtvochtigheid</Text>
        <Text style={styles.humidityValue}>{data.humidity}%</Text>
      </View>

      <View style={styles.modeRow}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeBtn, data.mode === m.key && styles.modeBtnActive]}
            onPress={() => onModeChange(m.key)}
          >
            <Text style={styles.modeIcon}>{m.icon}</Text>
            <Text style={[styles.modeLabel, data.mode === m.key && styles.modeLabelActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.widgetTitle,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tempSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentTempBlock: {
    flex: 1,
    alignItems: 'center',
  },
  tempSmallLabel: {
    ...typography.label,
    marginBottom: 4,
    fontSize: 11,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currentTemp: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 44,
  },
  tempUnit: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
    marginLeft: 2,
  },
  heatingLabel: {
    color: colors.accentAmber,
    fontSize: 11,
    marginTop: 4,
  },
  dividerVertical: {
    width: 1,
    height: 60,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },
  targetTempBlock: {
    flex: 1,
    alignItems: 'center',
  },
  targetControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tempBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent + '55',
  },
  tempBtnText: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 26,
  },
  targetTempRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  targetTemp: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    lineHeight: 36,
  },
  humidityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: colors.surface2,
    borderRadius: 10,
    marginBottom: 14,
  },
  humidityLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginLeft: 8,
  },
  humidityValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    gap: 4,
  },
  modeBtnActive: {
    backgroundColor: colors.accent + '33',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  modeIcon: {
    fontSize: 18,
  },
  modeLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  modeLabelActive: {
    color: colors.accent,
  },
});
