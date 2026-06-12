import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Room } from '../../types/dashboard';
import { colors, typography } from './dashboardTheme';

interface Props {
  rooms: Room[];
  onRoomToggle: (roomId: string) => void;
  onBrightnessChange: (roomId: string, brightness: number) => void;
}

export function LightingWidget({ rooms, onRoomToggle, onBrightnessChange }: Props) {
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const activeRooms = rooms.filter(r => r.isOn).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💡 Verlichting</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activeRooms}/{rooms.length} aan</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {rooms.map((room) => (
          <View key={room.id}>
            <TouchableOpacity
              style={styles.roomRow}
              onPress={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
              activeOpacity={0.7}
            >
              <View style={styles.roomLeft}>
                <Text style={styles.roomIcon}>{room.icon}</Text>
                <Text style={styles.roomName}>{room.name}</Text>
              </View>
              <View style={styles.roomRight}>
                {room.isOn && (
                  <Text style={styles.brightnessLabel}>{room.brightness}%</Text>
                )}
                <TouchableOpacity
                  style={[styles.toggle, room.isOn && styles.toggleActive]}
                  onPress={() => onRoomToggle(room.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <View style={[styles.toggleKnob, room.isOn && styles.toggleKnobActive]} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {expandedRoom === room.id && room.isOn && (
              <View style={styles.brightnessRow}>
                <Text style={styles.dimmerLabel}>Dimmer</Text>
                <View style={styles.dimmerButtons}>
                  {[25, 50, 75, 100].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.dimmerBtn,
                        room.brightness >= level && styles.dimmerBtnActive,
                      ]}
                      onPress={() => onBrightnessChange(room.id, level)}
                    >
                      <Text style={[
                        styles.dimmerBtnText,
                        room.brightness >= level && styles.dimmerBtnTextActive,
                      ]}>
                        {level}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
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
    marginBottom: 14,
  },
  title: {
    ...typography.widgetTitle,
  },
  badge: {
    backgroundColor: colors.accent + '33',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  roomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  roomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roomIcon: {
    fontSize: 20,
  },
  roomName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  roomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brightnessLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.accent,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  brightnessRow: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface2 + '55',
    borderRadius: 8,
    marginBottom: 2,
  },
  dimmerLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  dimmerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  dimmerBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface2,
    alignItems: 'center',
  },
  dimmerBtnActive: {
    backgroundColor: colors.accent + '44',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  dimmerBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  dimmerBtnTextActive: {
    color: colors.accent,
  },
});
