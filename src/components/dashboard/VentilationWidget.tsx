import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VentilationData } from '../../types/dashboard';
import { colors, typography } from './dashboardTheme';

interface Props {
  data: VentilationData;
  onSpeedChange: (speed: VentilationData['speed']) => void;
  onBoostToggle: () => void;
}

const SPEEDS: { level: VentilationData['speed']; label: string; icon: string }[] = [
  { level: 0, label: 'Uit', icon: '○' },
  { level: 1, label: 'Laag', icon: '◔' },
  { level: 2, label: 'Middel', icon: '◑' },
  { level: 3, label: 'Hoog', icon: '●' },
];

const FILTER_COLORS: Record<VentilationData['filterStatus'], string> = {
  ok: colors.accentGreen,
  warning: colors.accentAmber,
  replace: colors.accentRed,
};

const FILTER_LABELS: Record<VentilationData['filterStatus'], string> = {
  ok: 'Filter OK',
  warning: 'Filter controleren',
  replace: 'Filter vervangen',
};

export function VentilationWidget({ data, onSpeedChange, onBoostToggle }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💨 Novy Afzuigkap</Text>
        <View style={[styles.filterBadge, { borderColor: FILTER_COLORS[data.filterStatus] + '66' }]}>
          <View style={[styles.filterDot, { backgroundColor: FILTER_COLORS[data.filterStatus] }]} />
          <Text style={[styles.filterText, { color: FILTER_COLORS[data.filterStatus] }]}>
            {FILTER_LABELS[data.filterStatus]}
          </Text>
        </View>
      </View>

      <View style={styles.fanDisplay}>
        <Text style={[styles.fanIcon, data.isOn && styles.fanIconActive]}>
          {data.isOn ? '🌀' : '⊙'}
        </Text>
        <Text style={styles.speedLabel}>
          {data.isOn ? SPEEDS[data.speed].label : 'Uitgeschakeld'}
        </Text>
        {data.boostActive && (
          <View style={styles.boostBadge}>
            <Text style={styles.boostBadgeText}>BOOST</Text>
          </View>
        )}
      </View>

      <View style={styles.speedRow}>
        {SPEEDS.map((s) => (
          <TouchableOpacity
            key={s.level}
            style={[
              styles.speedBtn,
              data.speed === s.level && data.isOn && styles.speedBtnActive,
              s.level === 0 && data.speed === 0 && styles.speedBtnOff,
            ]}
            onPress={() => onSpeedChange(s.level)}
          >
            <Text style={[
              styles.speedBtnIcon,
              data.speed === s.level && s.level > 0 && styles.speedBtnIconActive,
            ]}>
              {s.icon}
            </Text>
            <Text style={[
              styles.speedBtnLabel,
              data.speed === s.level && s.level > 0 && styles.speedBtnLabelActive,
            ]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.boostBtn, data.boostActive && styles.boostBtnActive]}
        onPress={onBoostToggle}
      >
        <Text style={styles.boostBtnIcon}>🚀</Text>
        <View>
          <Text style={[styles.boostBtnTitle, data.boostActive && { color: colors.accentAmber }]}>
            {data.boostActive ? 'Boost uitschakelen' : 'Boost 10 min'}
          </Text>
          <Text style={styles.boostBtnSub}>Maximale ventilatie</Text>
        </View>
      </TouchableOpacity>
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
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    ...typography.widgetTitle,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fanDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  fanIcon: {
    fontSize: 48,
    opacity: 0.4,
  },
  fanIconActive: {
    opacity: 1,
  },
  speedLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  boostBadge: {
    backgroundColor: colors.accentAmber + '33',
    borderWidth: 1,
    borderColor: colors.accentAmber,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  boostBadgeText: {
    color: colors.accentAmber,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  speedBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    gap: 4,
  },
  speedBtnActive: {
    backgroundColor: colors.accent + '33',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  speedBtnOff: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  speedBtnIcon: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  speedBtnIconActive: {
    color: colors.accent,
  },
  speedBtnLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  speedBtnLabelActive: {
    color: colors.accent,
  },
  boostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.surface2,
    borderRadius: 12,
  },
  boostBtnActive: {
    backgroundColor: colors.accentAmber + '22',
    borderWidth: 1,
    borderColor: colors.accentAmber + '55',
  },
  boostBtnIcon: {
    fontSize: 22,
  },
  boostBtnTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  boostBtnSub: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
