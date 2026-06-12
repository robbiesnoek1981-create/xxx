import { API_CONFIG } from '../config/apiConfig';
import { Room } from '../types/dashboard';

const { proxyUrl, rooms: roomIps } = API_CONFIG.wiz;

// ----------------------------------------------------------------
// WiZ commands zijn gebaseerd op het lokale UDP JSON protocol
// De proxy server vertaalt HTTP→UDP (zie proxy-server/)
// ----------------------------------------------------------------

interface WizState {
  state: boolean;
  dimming?: number; // 10-100
  temp?: number;    // 2700-6500 K
  r?: number; g?: number; b?: number;
}

async function sendWizCommand(
  ip: string,
  params: WizState
): Promise<boolean> {
  try {
    const res = await fetch(`${proxyUrl}/wiz/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, params }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function getWizState(ip: string): Promise<WizState | null> {
  try {
    const res = await fetch(`${proxyUrl}/wiz/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result ?? null;
  } catch {
    return null;
  }
}

export async function fetchAllRoomStates(
  currentRooms: Room[]
): Promise<Room[]> {
  const updates = await Promise.all(
    currentRooms.map(async (room) => {
      const ips = roomIps[room.id];
      if (!ips || ips.length === 0) return room;

      const state = await getWizState(ips[0]);
      if (!state) return room;

      return {
        ...room,
        isOn: state.state,
        brightness: state.dimming ?? room.brightness,
        colorTemp: state.temp ?? room.colorTemp,
      };
    })
  );
  return updates;
}

export async function toggleRoom(room: Room): Promise<boolean> {
  const ips = roomIps[room.id] ?? [];
  const results = await Promise.all(
    ips.map(ip => sendWizCommand(ip, { state: !room.isOn }))
  );
  return results.some(Boolean);
}

export async function setRoomBrightness(
  room: Room,
  brightness: number
): Promise<boolean> {
  const ips = roomIps[room.id] ?? [];
  const dimming = Math.min(100, Math.max(10, brightness));
  const results = await Promise.all(
    ips.map(ip => sendWizCommand(ip, { state: true, dimming }))
  );
  return results.some(Boolean);
}

export async function setRoomColorTemp(
  room: Room,
  kelvin: number
): Promise<boolean> {
  const ips = roomIps[room.id] ?? [];
  const temp = Math.min(6500, Math.max(2700, kelvin));
  const results = await Promise.all(
    ips.map(ip => sendWizCommand(ip, { state: true, temp }))
  );
  return results.some(Boolean);
}
