import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SpotifyData } from '../../types/dashboard';
import { colors, typography } from './dashboardTheme';

interface Props {
  data: SpotifyData;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeChange: (delta: number) => void;
  onShuffleToggle: () => void;
  onLogin?: () => void;
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function SpotifyWidget({ data, onPlayPause, onNext, onPrevious, onVolumeChange, onShuffleToggle, onLogin }: Props) {
  const progress = data.currentTrack
    ? data.currentTrack.progressMs / data.currentTrack.durationMs
    : 0;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (data.isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [data.isPlaying]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎧 Spotify</Text>
        <View style={[styles.connectedBadge, !data.isConnected && styles.disconnectedBadge]}>
          <View style={[styles.connDot, { backgroundColor: data.isConnected ? colors.accentGreen : colors.accentRed }]} />
          <Text style={[styles.connText, { color: data.isConnected ? colors.accentGreen : colors.accentRed }]}>
            {data.isConnected ? 'Verbonden' : 'Niet verbonden'}
          </Text>
        </View>
      </View>

      {data.currentTrack ? (
        <>
          <View style={styles.trackSection}>
            <Animated.Text style={[styles.albumArt, { transform: [{ scale: pulseAnim }] }]}>
              {data.currentTrack.albumArt}
            </Animated.Text>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{data.currentTrack.title}</Text>
              <Text style={styles.trackArtist} numberOfLines={1}>{data.currentTrack.artist}</Text>
              <Text style={styles.trackAlbum} numberOfLines={1}>{data.currentTrack.album}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
            </View>
            <View style={styles.progressTimes}>
              <Text style={styles.progressTime}>{formatMs(data.currentTrack.progressMs)}</Text>
              <Text style={styles.progressTime}>{formatMs(data.currentTrack.durationMs)}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlBtn, data.shuffle && styles.controlBtnActive]}
              onPress={onShuffleToggle}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.controlIcon, data.shuffle && { color: colors.accentGreen }]}>🔀</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navBtn} onPress={onPrevious}>
              <Text style={styles.navBtnText}>⏮</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.playBtn} onPress={onPlayPause}>
              <Text style={styles.playBtnText}>{data.isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navBtn} onPress={onNext}>
              <Text style={styles.navBtnText}>⏭</Text>
            </TouchableOpacity>

            <View style={styles.volumeControl}>
              <TouchableOpacity
                onPress={() => onVolumeChange(-10)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.volumeIcon}>🔉</Text>
              </TouchableOpacity>
              <View style={styles.volumeBarBg}>
                <View style={[styles.volumeBarFill, { width: `${data.volume}%` as any }]} />
              </View>
              <TouchableOpacity
                onPress={() => onVolumeChange(10)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.volumeIcon}>🔊</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : data.isConnected ? (
        <View style={styles.noTrack}>
          <Text style={styles.noTrackIcon}>🎵</Text>
          <Text style={styles.noTrackText}>Geen muziek aan het spelen</Text>
        </View>
      ) : (
        <View style={styles.noTrack}>
          <Text style={styles.noTrackIcon}>🔒</Text>
          <Text style={styles.noTrackText}>Niet ingelogd bij Spotify</Text>
          {onLogin && (
            <TouchableOpacity style={styles.loginBtn} onPress={onLogin}>
              <Text style={styles.loginBtnText}>Inloggen met Spotify</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.accentGreen + '22',
  },
  disconnectedBadge: {
    backgroundColor: colors.accentRed + '22',
  },
  connDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  connText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trackSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    backgroundColor: colors.surface2,
    borderRadius: 14,
    padding: 14,
  },
  albumArt: {
    fontSize: 44,
  },
  trackInfo: {
    flex: 1,
    gap: 3,
  },
  trackTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  trackAlbum: {
    color: colors.textMuted,
    fontSize: 12,
  },
  progressSection: {
    marginBottom: 16,
    gap: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surface2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1db954',
    borderRadius: 2,
  },
  progressTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTime: {
    color: colors.textMuted,
    fontSize: 11,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnActive: {
    backgroundColor: colors.accentGreen + '22',
    borderWidth: 1,
    borderColor: colors.accentGreen + '55',
  },
  controlIcon: {
    fontSize: 16,
  },
  navBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnText: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1db954',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  playBtnText: {
    fontSize: 22,
  },
  volumeControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  volumeIcon: {
    fontSize: 16,
  },
  volumeBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surface2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeBarFill: {
    height: '100%',
    backgroundColor: colors.textSecondary,
    borderRadius: 2,
  },
  noTrack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  noTrackIcon: {
    fontSize: 36,
    opacity: 0.4,
  },
  noTrackText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginBtn: {
    marginTop: 12,
    backgroundColor: '#1db954',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
