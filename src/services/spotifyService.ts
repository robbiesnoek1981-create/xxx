import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/apiConfig';
import { SpotifyData, SpotifyTrack } from '../types/dashboard';

WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEY_TOKEN = 'spotify_access_token';
const STORAGE_KEY_REFRESH = 'spotify_refresh_token';
const STORAGE_KEY_EXPIRY = 'spotify_token_expiry';

const BASE_URL = 'https://api.spotify.com/v1';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

// Call this once from your component to get the auth request
export function useSpotifyAuth() {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: API_CONFIG.spotify.clientId,
      scopes: API_CONFIG.spotify.scopes,
      usePKCE: true,
      redirectUri: API_CONFIG.spotify.redirectUri,
    },
    discovery
  );

  return { request, response, promptAsync };
}

async function getStoredToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
  const expiryStr = await AsyncStorage.getItem(STORAGE_KEY_EXPIRY);
  if (!token || !expiryStr) return null;
  if (Date.now() > parseInt(expiryStr, 10)) return null;
  return token;
}

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string
): Promise<boolean> {
  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: API_CONFIG.spotify.redirectUri,
      client_id: API_CONFIG.spotify.clientId,
      code_verifier: codeVerifier,
    });

    const res = await fetch(discovery.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) return false;
    const data = await res.json();

    await AsyncStorage.setItem(STORAGE_KEY_TOKEN, data.access_token);
    await AsyncStorage.setItem(STORAGE_KEY_REFRESH, data.refresh_token ?? '');
    await AsyncStorage.setItem(
      STORAGE_KEY_EXPIRY,
      String(Date.now() + data.expires_in * 1000)
    );
    return true;
  } catch {
    return false;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEY_REFRESH);
  if (!refreshToken) return null;

  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: API_CONFIG.spotify.clientId,
    });

    const res = await fetch(discovery.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) return null;
    const data = await res.json();

    await AsyncStorage.setItem(STORAGE_KEY_TOKEN, data.access_token);
    await AsyncStorage.setItem(
      STORAGE_KEY_EXPIRY,
      String(Date.now() + data.expires_in * 1000)
    );
    return data.access_token;
  } catch {
    return null;
  }
}

async function getToken(): Promise<string | null> {
  const stored = await getStoredToken();
  if (stored) return stored;
  return refreshAccessToken();
}

async function spotifyFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response | null> {
  const token = await getToken();
  if (!token) return null;

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

export async function fetchCurrentPlayback(): Promise<SpotifyData | null> {
  try {
    const res = await spotifyFetch('/me/player');
    if (!res) return null;
    if (res.status === 204) {
      // No active player
      return {
        isConnected: true,
        isPlaying: false,
        currentTrack: null,
        volume: 50,
        shuffle: false,
        repeat: 'off',
      };
    }
    if (!res.ok) return null;

    const data = await res.json();
    const item = data.item;

    const track: SpotifyTrack | null = item
      ? {
          title: item.name,
          artist: item.artists.map((a: { name: string }) => a.name).join(', '),
          album: item.album.name,
          albumArt: item.album.images?.[0]?.url ?? '🎵',
          durationMs: item.duration_ms,
          progressMs: data.progress_ms ?? 0,
        }
      : null;

    return {
      isConnected: true,
      isPlaying: data.is_playing,
      currentTrack: track,
      volume: data.device?.volume_percent ?? 50,
      shuffle: data.shuffle_state,
      repeat: data.repeat_state,
    };
  } catch {
    return null;
  }
}

export async function spotifyPlayPause(isCurrentlyPlaying: boolean): Promise<void> {
  await spotifyFetch(`/me/player/${isCurrentlyPlaying ? 'pause' : 'play'}`, {
    method: 'PUT',
  });
}

export async function spotifyNext(): Promise<void> {
  await spotifyFetch('/me/player/next', { method: 'POST' });
}

export async function spotifyPrevious(): Promise<void> {
  await spotifyFetch('/me/player/previous', { method: 'POST' });
}

export async function spotifySetVolume(volumePct: number): Promise<void> {
  const vol = Math.min(100, Math.max(0, Math.round(volumePct)));
  await spotifyFetch(`/me/player/volume?volume_percent=${vol}`, { method: 'PUT' });
}

export async function spotifySetShuffle(state: boolean): Promise<void> {
  await spotifyFetch(`/me/player/shuffle?state=${state}`, { method: 'PUT' });
}

export async function clearSpotifyTokens(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_REFRESH, STORAGE_KEY_EXPIRY]);
}
