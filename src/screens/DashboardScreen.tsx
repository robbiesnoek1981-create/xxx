import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { DashboardState, Room, ThermostatData, VentilationData, SpotifyData } from '../types/dashboard';
import {
  initialDashboardState,
  getUpdatedSolarData,
  getUpdatedThermostat,
} from '../services/dashboardMockService';
import {
  useSpotifyAuth,
  exchangeCodeForToken,
  fetchCurrentPlayback,
  spotifyPlayPause,
  spotifyNext,
  spotifyPrevious,
  spotifySetVolume,
  spotifySetShuffle,
} from '../services/spotifyService';
import { fetchSolarData } from '../services/solarEdgeService';
import { LightingWidget } from '../components/dashboard/LightingWidget';
import { ThermostatWidget } from '../components/dashboard/ThermostatWidget';
import { SolarWidget } from '../components/dashboard/SolarWidget';
import { VentilationWidget } from '../components/dashboard/VentilationWidget';
import { SpotifyWidget } from '../components/dashboard/SpotifyWidget';
import { colors, typography } from '../components/dashboard/dashboardTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

const MOCK_PLAYLIST = [
  { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', albumArt: '🎵', durationMs: 200040, progressMs: 74000 },
  { title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', albumArt: '🎶', durationMs: 203000, progressMs: 0 },
  { title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', album: 'Stay', albumArt: '🎼', durationMs: 141000, progressMs: 0 },
  { title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', albumArt: '🔥', durationMs: 238000, progressMs: 0 },
  { title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", albumArt: '🏡', durationMs: 167000, progressMs: 0 },
];

function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Set to true when you have configured real API credentials
const USE_LIVE_APIS = false;

export function DashboardScreen() {
  const [state, setState] = useState<DashboardState>(initialDashboardState);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const now = useCurrentTime();

  // Spotify OAuth
  const { request, response, promptAsync } = useSpotifyAuth();
  const spotifyTokenExchanged = useRef(false);

  // Handle Spotify OAuth response
  useEffect(() => {
    if (
      response?.type === 'success' &&
      response.params?.code &&
      request?.codeVerifier &&
      !spotifyTokenExchanged.current
    ) {
      spotifyTokenExchanged.current = true;
      exchangeCodeForToken(response.params.code, request.codeVerifier).then(ok => {
        if (ok) {
          setState(prev => ({
            ...prev,
            spotify: { ...prev.spotify, isConnected: true },
          }));
        }
      });
    }
  }, [response]);

  // Live Spotify polling (every 5s)
  useEffect(() => {
    if (!USE_LIVE_APIS) return;
    const poll = async () => {
      const data = await fetchCurrentPlayback();
      if (data) setState(prev => ({ ...prev, spotify: data }));
    };
    poll();
    const t = setInterval(poll, 5000);
    return () => clearInterval(t);
  }, []);

  // Live SolarEdge polling (every 30s)
  useEffect(() => {
    if (!USE_LIVE_APIS) return;
    const poll = async () => {
      const data = await fetchSolarData();
      if (data) setState(prev => ({ ...prev, solar: data }));
    };
    poll();
    const t = setInterval(poll, 30_000);
    return () => clearInterval(t);
  }, []);

  // Mock simulation when live APIs are off
  useEffect(() => {
    if (USE_LIVE_APIS) return;
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        solar: getUpdatedSolarData(prev.solar),
        thermostat: getUpdatedThermostat(prev.thermostat),
        lastUpdated: new Date(),
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Simulate Spotify progress
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        if (!prev.spotify.isPlaying || !prev.spotify.currentTrack) return prev;
        const newProgress = prev.spotify.currentTrack.progressMs + 1000;
        if (newProgress >= prev.spotify.currentTrack.durationMs) {
          // auto-advance track
          const nextIndex = (playlistIndex + 1) % MOCK_PLAYLIST.length;
          setPlaylistIndex(nextIndex);
          return {
            ...prev,
            spotify: { ...prev.spotify, currentTrack: { ...MOCK_PLAYLIST[nextIndex] } },
          };
        }
        return {
          ...prev,
          spotify: {
            ...prev.spotify,
            currentTrack: { ...prev.spotify.currentTrack, progressMs: newProgress },
          },
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playlistIndex]);

  const handleRoomToggle = useCallback((roomId: string) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, isOn: !r.isOn } : r),
    }));
  }, []);

  const handleBrightnessChange = useCallback((roomId: string, brightness: number) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, brightness } : r),
    }));
  }, []);

  const handleTargetTempChange = useCallback((delta: number) => {
    setState(prev => ({
      ...prev,
      thermostat: {
        ...prev.thermostat,
        targetTemp: Math.round((prev.thermostat.targetTemp + delta) * 2) / 2,
      },
    }));
  }, []);

  const handleModeChange = useCallback((mode: ThermostatData['mode']) => {
    setState(prev => ({ ...prev, thermostat: { ...prev.thermostat, mode } }));
  }, []);

  const handleVentilationSpeed = useCallback((speed: VentilationData['speed']) => {
    setState(prev => ({
      ...prev,
      ventilation: {
        ...prev.ventilation,
        speed,
        isOn: speed > 0,
        boostActive: speed > 0 ? prev.ventilation.boostActive : false,
      },
    }));
  }, []);

  const handleBoostToggle = useCallback(() => {
    setState(prev => {
      const boostActive = !prev.ventilation.boostActive;
      return {
        ...prev,
        ventilation: {
          ...prev.ventilation,
          boostActive,
          isOn: boostActive ? true : prev.ventilation.speed > 0,
          speed: boostActive ? 3 : prev.ventilation.speed,
        },
      };
    });
  }, []);

  const handlePlayPause = useCallback(async () => {
    const playing = state.spotify.isPlaying;
    setState(prev => ({ ...prev, spotify: { ...prev.spotify, isPlaying: !playing } }));
    if (USE_LIVE_APIS) await spotifyPlayPause(playing);
  }, [state.spotify.isPlaying]);

  const handleNext = useCallback(async () => {
    const nextIndex = (playlistIndex + 1) % MOCK_PLAYLIST.length;
    setPlaylistIndex(nextIndex);
    setState(prev => ({
      ...prev,
      spotify: { ...prev.spotify, currentTrack: { ...MOCK_PLAYLIST[nextIndex] }, isPlaying: true },
    }));
    if (USE_LIVE_APIS) await spotifyNext();
  }, [playlistIndex]);

  const handlePrevious = useCallback(async () => {
    const prevIndex = (playlistIndex - 1 + MOCK_PLAYLIST.length) % MOCK_PLAYLIST.length;
    setPlaylistIndex(prevIndex);
    setState(prev => ({
      ...prev,
      spotify: { ...prev.spotify, currentTrack: { ...MOCK_PLAYLIST[prevIndex] }, isPlaying: true },
    }));
    if (USE_LIVE_APIS) await spotifyPrevious();
  }, [playlistIndex]);

  const handleVolumeChange = useCallback(async (delta: number) => {
    const newVol = Math.min(100, Math.max(0, state.spotify.volume + delta));
    setState(prev => ({ ...prev, spotify: { ...prev.spotify, volume: newVol } }));
    if (USE_LIVE_APIS) await spotifySetVolume(newVol);
  }, [state.spotify.volume]);

  const handleShuffleToggle = useCallback(async () => {
    const newShuffle = !state.spotify.shuffle;
    setState(prev => ({ ...prev, spotify: { ...prev.spotify, shuffle: newShuffle } }));
    if (USE_LIVE_APIS) await spotifySetShuffle(newShuffle);
  }, [state.spotify.shuffle]);

  const handleSpotifyLogin = useCallback(() => {
    promptAsync();
  }, [promptAsync]);

  const topBar = (
    <View style={IS_TABLET ? styles.topBar : styles.topBarMobile}>
      <View style={styles.topBarLeft}>
        <Text style={styles.timeText}>{formatTime(now)}</Text>
        <Text style={IS_TABLET ? styles.dateText : styles.dateTextMobile}>{formatDate(now)}</Text>
      </View>
      <View style={styles.weatherBlock}>
        <Text style={styles.weatherIcon}>{state.weather.icon}</Text>
        {IS_TABLET && (
          <View>
            <Text style={styles.weatherTemp}>{state.weather.temperature}°C</Text>
            <Text style={styles.weatherDesc}>{state.weather.description}</Text>
          </View>
        )}
        {!IS_TABLET && <Text style={styles.weatherTemp}>{state.weather.temperature}°C</Text>}
      </View>
      {IS_TABLET && (
        <View style={styles.topBarRight}>
          <Text style={styles.homeName}>🏡 Thuis</Text>
          <Text style={styles.lastUpdated}>Bijgewerkt: {formatTime(state.lastUpdated)}</Text>
        </View>
      )}
    </View>
  );

  if (IS_TABLET) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        {topBar}
        <ScrollView contentContainerStyle={styles.gridTablet} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <LightingWidget
              rooms={state.rooms}
              onRoomToggle={handleRoomToggle}
              onBrightnessChange={handleBrightnessChange}
            />
          </View>
          <View style={styles.card}>
            <ThermostatWidget
              data={state.thermostat}
              onTargetChange={handleTargetTempChange}
              onModeChange={handleModeChange}
            />
          </View>
          <View style={styles.card}>
            <SolarWidget data={state.solar} />
          </View>
          <View style={styles.card}>
            <VentilationWidget
              data={state.ventilation}
              onSpeedChange={handleVentilationSpeed}
              onBoostToggle={handleBoostToggle}
            />
          </View>
          <View style={[styles.card, styles.cardWide]}>
            <SpotifyWidget
              data={state.spotify}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onVolumeChange={handleVolumeChange}
              onShuffleToggle={handleShuffleToggle}
              onLogin={handleSpotifyLogin}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {topBar}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.cardMobile}>
          <SpotifyWidget
            data={state.spotify}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onVolumeChange={handleVolumeChange}
            onShuffleToggle={handleShuffleToggle}
            onLogin={handleSpotifyLogin}
          />
        </View>
        <View style={styles.cardMobile}>
          <LightingWidget
            rooms={state.rooms}
            onRoomToggle={handleRoomToggle}
            onBrightnessChange={handleBrightnessChange}
          />
        </View>
        <View style={styles.cardMobile}>
          <ThermostatWidget
            data={state.thermostat}
            onTargetChange={handleTargetTempChange}
            onModeChange={handleModeChange}
          />
        </View>
        <View style={styles.cardMobile}>
          <SolarWidget data={state.solar} />
        </View>
        <View style={styles.cardMobile}>
          <VentilationWidget
            data={state.ventilation}
            onSpeedChange={handleVentilationSpeed}
            onBoostToggle={handleBoostToggle}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  topBarMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  topBarLeft: {
    flex: 1,
  },
  topBarRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timeText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  dateTextMobile: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  weatherBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  weatherIcon: {
    fontSize: 22,
  },
  weatherTemp: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  weatherDesc: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  homeName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  lastUpdated: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  gridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  card: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    minHeight: 300,
  },
  cardWide: {
    width: '100%',
  },
  scrollContent: {
    padding: 12,
    gap: 12,
  },
  cardMobile: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    minHeight: 260,
  },
});
