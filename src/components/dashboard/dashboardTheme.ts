export const colors = {
  background: '#0a0f1e',
  surface: '#111827',
  surface2: '#1e293b',
  surface3: '#263347',
  accent: '#3b82f6',
  accentGreen: '#22c55e',
  accentAmber: '#f59e0b',
  accentRed: '#ef4444',
  accentPurple: '#a855f7',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#475569',
  divider: '#1e293b',
  cardBorder: '#1e293b',
};

export const typography = {
  widgetTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700' as const,
  },
  metricUnit: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
};
