export interface Room {
  id: string;
  name: string;
  icon: string;
  isOn: boolean;
  brightness: number; // 0-100
  colorTemp: number; // 2700-6500K
}

export interface ThermostatData {
  currentTemp: number;
  targetTemp: number;
  mode: 'heat' | 'cool' | 'auto' | 'off';
  humidity: number;
  isHeating: boolean;
}

export interface SolarData {
  currentProduction: number; // Watts
  currentConsumption: number; // Watts
  gridFeedIn: number; // Watts (positive = feeding, negative = drawing)
  todayProduction: number; // kWh
  todayEarnings: number; // EUR
  batteryLevel?: number; // percentage (optional)
  panelCount: number;
}

export interface VentilationData {
  isOn: boolean;
  speed: 0 | 1 | 2 | 3; // 0=off, 1=low, 2=medium, 3=high
  boostActive: boolean;
  filterStatus: 'ok' | 'warning' | 'replace';
}

export interface SpotifyTrack {
  title: string;
  artist: string;
  album: string;
  albumArt: string; // emoji placeholder until real API
  durationMs: number;
  progressMs: number;
}

export interface SpotifyData {
  isConnected: boolean;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  volume: number; // 0-100
  shuffle: boolean;
  repeat: 'off' | 'context' | 'track';
}

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
}

export interface DashboardState {
  rooms: Room[];
  thermostat: ThermostatData;
  solar: SolarData;
  ventilation: VentilationData;
  spotify: SpotifyData;
  weather: WeatherData;
  lastUpdated: Date;
}
