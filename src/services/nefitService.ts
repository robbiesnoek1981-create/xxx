import { API_CONFIG } from '../config/apiConfig';
import { ThermostatData } from '../types/dashboard';

const { proxyUrl } = API_CONFIG.nefit;

// ----------------------------------------------------------------
// Nefit Easy / Bosch EasyControl gebruikt het XMPP-protocol.
// De proxy server handelt de authenticatie en communicatie af
// via de nefit-easy-core Node.js library (zie proxy-server/).
// ----------------------------------------------------------------

async function nefitGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${proxyUrl}/nefit${path}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function nefitPost(path: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${proxyUrl}/nefit${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface NefitStatus {
  'user mode': string;            // 'clock' | 'manual'
  'boiler indicator': string;     // 'No' | 'CH' | 'HW'
  'in house temp': number;
  'temp setpoint': number;
  'outdoor temp': number;
}

interface NefitPressure {
  pressure: number;
}

export async function fetchThermostatData(): Promise<ThermostatData | null> {
  const [status, humidity] = await Promise.all([
    nefitGet<NefitStatus>('/status'),
    nefitGet<{ humidity: number }>('/humidity'),
  ]);

  if (!status) return null;

  const boilerOn = status['boiler indicator'] === 'CH';

  return {
    currentTemp: status['in house temp'],
    targetTemp: status['temp setpoint'],
    mode: boilerOn ? 'heat' : status['user mode'] === 'manual' ? 'heat' : 'auto',
    humidity: humidity?.humidity ?? 50,
    isHeating: boilerOn,
  };
}

export async function setTargetTemperature(temp: number): Promise<boolean> {
  const rounded = Math.round(temp * 2) / 2; // Nefit uses 0.5°C steps
  return nefitPost('/setpoint', { value: rounded });
}

export async function setMode(
  mode: ThermostatData['mode']
): Promise<boolean> {
  if (mode === 'off') {
    return nefitPost('/usermode', { value: 'manual' });
  }
  return nefitPost('/usermode', { value: mode === 'auto' ? 'clock' : 'manual' });
}
