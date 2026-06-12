import { DashboardState, Room, ThermostatData, SolarData, VentilationData, SpotifyData } from '../types/dashboard';

export const initialDashboardState: DashboardState = {
  rooms: [
    { id: 'woonkamer', name: 'Woonkamer', icon: '🛋️', isOn: true, brightness: 75, colorTemp: 3000 },
    { id: 'keuken', name: 'Keuken', icon: '🍳', isOn: true, brightness: 100, colorTemp: 4000 },
    { id: 'slaapkamer', name: 'Slaapkamer', icon: '🛏️', isOn: false, brightness: 50, colorTemp: 2700 },
    { id: 'badkamer', name: 'Badkamer', icon: '🚿', isOn: false, brightness: 80, colorTemp: 5000 },
    { id: 'studeerkamer', name: 'Studeerkamer', icon: '💻', isOn: true, brightness: 90, colorTemp: 5500 },
    { id: 'gang', name: 'Gang', icon: '🚪', isOn: false, brightness: 60, colorTemp: 3500 },
  ],
  thermostat: {
    currentTemp: 20.4,
    targetTemp: 21.0,
    mode: 'heat',
    humidity: 52,
    isHeating: true,
  },
  solar: {
    currentProduction: 2840,
    currentConsumption: 1120,
    gridFeedIn: 1720,
    todayProduction: 14.7,
    todayEarnings: 4.26,
    panelCount: 14,
  },
  ventilation: {
    isOn: false,
    speed: 0,
    boostActive: false,
    filterStatus: 'ok',
  },
  spotify: {
    isConnected: true,
    isPlaying: true,
    currentTrack: {
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      albumArt: '🎵',
      durationMs: 200040,
      progressMs: 74000,
    },
    volume: 65,
    shuffle: false,
    repeat: 'off',
  },
  weather: {
    temperature: 17,
    description: 'Bewolkt',
    icon: '⛅',
    humidity: 68,
  },
  lastUpdated: new Date(),
};

// Simulate live solar data changes
export function getUpdatedSolarData(current: SolarData): SolarData {
  const variation = (Math.random() - 0.5) * 200;
  const newProduction = Math.max(0, current.currentProduction + variation);
  const consVariation = (Math.random() - 0.5) * 100;
  const newConsumption = Math.max(200, current.currentConsumption + consVariation);
  return {
    ...current,
    currentProduction: Math.round(newProduction),
    currentConsumption: Math.round(newConsumption),
    gridFeedIn: Math.round(newProduction - newConsumption),
  };
}

export function getUpdatedThermostat(current: ThermostatData): ThermostatData {
  const variation = (Math.random() - 0.5) * 0.1;
  return {
    ...current,
    currentTemp: Math.round((current.currentTemp + variation) * 10) / 10,
    isHeating: current.currentTemp < current.targetTemp,
  };
}

export function formatWatts(watts: number): string {
  if (Math.abs(watts) >= 1000) {
    return `${(watts / 1000).toFixed(2)} kW`;
  }
  return `${Math.round(watts)} W`;
}

export function formatKwh(kwh: number): string {
  return `${kwh.toFixed(1)} kWh`;
}
