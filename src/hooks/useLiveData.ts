import { useEffect, useCallback, useRef } from 'react';
import { DashboardState } from '../types/dashboard';
import { fetchSolarData } from '../services/solarEdgeService';
import { fetchThermostatData, setTargetTemperature, setMode } from '../services/nefitService';
import { fetchAllRoomStates, toggleRoom, setRoomBrightness } from '../services/wizService';
import { getUpdatedSolarData, getUpdatedThermostat } from '../services/dashboardMockService';

// Set to true to use real APIs, false to use mock data
const USE_LIVE_DATA = false;

type SetState = React.Dispatch<React.SetStateAction<DashboardState>>;

export function useLiveData(setState: SetState, state: DashboardState) {
  const stateRef = useRef(state);
  stateRef.current = state;

  // Poll solar data every 30s
  useEffect(() => {
    if (!USE_LIVE_DATA) return;
    const poll = async () => {
      const data = await fetchSolarData();
      if (data) setState(prev => ({ ...prev, solar: data }));
    };
    poll();
    const t = setInterval(poll, 30_000);
    return () => clearInterval(t);
  }, []);

  // Poll thermostat every 60s
  useEffect(() => {
    if (!USE_LIVE_DATA) return;
    const poll = async () => {
      const data = await fetchThermostatData();
      if (data) setState(prev => ({ ...prev, thermostat: data }));
    };
    poll();
    const t = setInterval(poll, 60_000);
    return () => clearInterval(t);
  }, []);

  // Poll WiZ room states every 30s
  useEffect(() => {
    if (!USE_LIVE_DATA) return;
    const poll = async () => {
      const rooms = await fetchAllRoomStates(stateRef.current.rooms);
      setState(prev => ({ ...prev, rooms }));
    };
    poll();
    const t = setInterval(poll, 30_000);
    return () => clearInterval(t);
  }, []);

  // Mock simulation when live data is off
  useEffect(() => {
    if (USE_LIVE_DATA) return;
    const t = setInterval(() => {
      setState(prev => ({
        ...prev,
        solar: getUpdatedSolarData(prev.solar),
        thermostat: getUpdatedThermostat(prev.thermostat),
        lastUpdated: new Date(),
      }));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const handleRoomToggle = useCallback(async (roomId: string) => {
    const room = stateRef.current.rooms.find(r => r.id === roomId);
    if (!room) return;
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, isOn: !r.isOn } : r),
    }));
    if (USE_LIVE_DATA) {
      const ok = await toggleRoom(room);
      if (!ok) {
        // Revert on failure
        setState(prev => ({
          ...prev,
          rooms: prev.rooms.map(r => r.id === roomId ? { ...r, isOn: room.isOn } : r),
        }));
      }
    }
  }, []);

  const handleBrightnessChange = useCallback(async (roomId: string, brightness: number) => {
    const room = stateRef.current.rooms.find(r => r.id === roomId);
    if (!room) return;
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, brightness } : r),
    }));
    if (USE_LIVE_DATA) {
      await setRoomBrightness(room, brightness);
    }
  }, []);

  const handleTargetTempChange = useCallback(async (delta: number) => {
    const current = stateRef.current.thermostat;
    const newTemp = Math.round((current.targetTemp + delta) * 2) / 2;
    setState(prev => ({
      ...prev,
      thermostat: { ...prev.thermostat, targetTemp: newTemp },
    }));
    if (USE_LIVE_DATA) {
      await setTargetTemperature(newTemp);
    }
  }, []);

  const handleModeChange = useCallback(async (mode: DashboardState['thermostat']['mode']) => {
    setState(prev => ({ ...prev, thermostat: { ...prev.thermostat, mode } }));
    if (USE_LIVE_DATA) {
      await setMode(mode);
    }
  }, []);

  return {
    handleRoomToggle,
    handleBrightnessChange,
    handleTargetTempChange,
    handleModeChange,
  };
}
