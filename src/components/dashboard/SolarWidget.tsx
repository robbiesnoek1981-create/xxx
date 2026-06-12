import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SolarData } from '../../types/dashboard';
import { colors, typography } from './dashboardTheme';
import { formatWatts, formatKwh } from '../../services/dashboardMockService';

interface Props {
  data: SolarData;
}

function FlowBar({ production, consumption }: { production: number; consumption: number }) {
  const max = Math.max(production, consumption, 500);
  const prodPct = Math.min(100, (production / max) * 100);
  const consPct = Math.min(100, (consumption / max) * 100);
  const isFeedingGrid = production > consumption;

  return (
    <View style={styles.flowContainer}>
      <View style={styles.flowItem}>
        <Text style={styles.flowIcon}>☀️</Text>
        <Text style={styles.flowLabel}>Opwek</Text>
        <Text style={[styles.flowValue, { color: colors.accentAmber }]}>
          {formatWatts(production)}
        </Text>
        <View style={styles.flowBarBg}>
          <View style={[styles.flowBarFill, { width: `${prodPct}%` as any, backgroundColor: colors.accentAmber }]} />
        </View>
      </View>

      <View style={styles.flowArrow}>
        <Text style={[styles.flowArrowText, { color: isFeedingGrid ? colors.accentGreen : colors.accentRed }]}>
          {isFeedingGrid ? '→' : '←'}
        </Text>
        <Text style={[styles.flowArrowLabel, { color: isFeedingGrid ? colors.accentGreen : colors.accentRed }]}>
          {isFeedingGrid ? 'Levering' : 'Afname'}
        </Text>
        <Text style={[styles.flowArrowValue, { color: isFeedingGrid ? colors.accentGreen : colors.accentRed }]}>
          {formatWatts(Math.abs(production - consumption))}
        </Text>
      </View>

      <View style={styles.flowItem}>
        <Text style={styles.flowIcon}>🏠</Text>
        <Text style={styles.flowLabel}>Verbruik</Text>
        <Text style={[styles.flowValue, { color: colors.accent }]}>
          {formatWatts(consumption)}
        </Text>
        <View style={styles.flowBarBg}>
          <View style={[styles.flowBarFill, { width: `${consPct}%` as any, backgroundColor: colors.accent }]} />
        </View>
      </View>
    </View>
  );
}

export function SolarWidget({ data }: Props) {
  const selfConsumptionPct = data.currentProduction > 0
    ? Math.min(100, Math.round((Math.min(data.currentProduction, data.currentConsumption) / data.currentProduction) * 100))
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Zonnepanelen</Text>
        <Text style={styles.panelCount}>{data.panelCount} panelen</Text>
      </View>

      <FlowBar production={data.currentProduction} consumption={data.currentConsumption} />

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Vandaag</Text>
          <Text style={styles.statValue}>{formatKwh(data.todayProduction)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Opbrengst</Text>
          <Text style={[styles.statValue, { color: colors.accentGreen }]}>
            € {data.todayEarnings.toFixed(2)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Eigenverbruik</Text>
          <Text style={styles.statValue}>{selfConsumptionPct}%</Text>
        </View>
      </View>

      <View style={styles.gridStatus}>
        {data.gridFeedIn >= 0 ? (
          <>
            <Text style={styles.gridIcon}>🔋</Text>
            <Text style={[styles.gridText, { color: colors.accentGreen }]}>
              Teruglevering: {formatWatts(data.gridFeedIn)}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.gridIcon}>⚡</Text>
            <Text style={[styles.gridText, { color: colors.accentRed }]}>
              Netafname: {formatWatts(Math.abs(data.gridFeedIn))}
            </Text>
          </>
        )}
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
  panelCount: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  flowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  flowItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  flowIcon: {
    fontSize: 22,
  },
  flowLabel: {
    ...typography.label,
    fontSize: 10,
  },
  flowValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  flowBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: colors.surface2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  flowBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  flowArrow: {
    alignItems: 'center',
    gap: 2,
    minWidth: 56,
  },
  flowArrowText: {
    fontSize: 20,
    fontWeight: '700',
  },
  flowArrowLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  flowArrowValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    ...typography.label,
    fontSize: 10,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 8,
  },
  gridStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  gridIcon: {
    fontSize: 16,
  },
  gridText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
