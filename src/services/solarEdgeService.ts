import { API_CONFIG } from '../config/apiConfig';
import { SolarData } from '../types/dashboard';

const { apiKey, siteId, baseUrl } = API_CONFIG.solarEdge;

function seUrl(path: string, params: Record<string, string> = {}): string {
  const query = new URLSearchParams({ api_key: apiKey, ...params });
  return `${baseUrl}${path}?${query}`;
}

interface CurrentPowerFlowResponse {
  siteCurrentPowerFlow: {
    unit: string;
    connections: Array<{ from: string; to: string }>;
    GRID: { status: string; currentPower: number };
    LOAD: { status: string; currentPower: number };
    PV: { status: string; currentPower: number };
    STORAGE?: { status: string; currentPower: number; chargeLevel: number };
  };
}

interface EnergyDetailsResponse {
  energyDetails: {
    timeUnit: string;
    unit: string;
    meters: Array<{
      type: string;
      values: Array<{ date: string; value: number | null }>;
    }>;
  };
}

function wattsFromKw(kw: number, unit: string): number {
  return unit.toUpperCase() === 'KW' ? kw * 1000 : kw;
}

export async function fetchSolarData(): Promise<SolarData | null> {
  try {
    const [flowRes, energyRes] = await Promise.all([
      fetch(seUrl(`/site/${siteId}/currentPowerFlow`)),
      fetch(
        seUrl(`/site/${siteId}/energyDetails`, {
          timeUnit: 'DAY',
          startTime: todayStartIso(),
          endTime: nowIso(),
          meters: 'PRODUCTION,CONSUMPTION,FEEDIN',
        })
      ),
    ]);

    if (!flowRes.ok || !energyRes.ok) return null;

    const flowData: CurrentPowerFlowResponse = await flowRes.json();
    const energyData: EnergyDetailsResponse = await energyRes.json();

    const flow = flowData.siteCurrentPowerFlow;
    const unit = flow.unit;

    const production = wattsFromKw(flow.PV?.currentPower ?? 0, unit);
    const consumption = wattsFromKw(flow.LOAD?.currentPower ?? 0, unit);
    const gridPower = wattsFromKw(flow.GRID?.currentPower ?? 0, unit);

    // Positive gridFeedIn = exporting to grid
    const isExporting = flow.connections.some(
      c => c.from === 'PV' && c.to === 'GRID'
    );
    const gridFeedIn = isExporting ? gridPower : -gridPower;

    // Parse today's totals from energy details
    const meters = energyData.energyDetails.meters;
    const prodMeter = meters.find(m => m.type === 'Production');
    const todayProduction = sumMeterValues(prodMeter) / 1000; // Wh → kWh

    const feedInMeter = meters.find(m => m.type === 'FeedIn');
    const todayFeedIn = sumMeterValues(feedInMeter) / 1000;
    // Rough earnings at €0.09/kWh teruglevering
    const todayEarnings = todayFeedIn * 0.09;

    return {
      currentProduction: Math.round(production),
      currentConsumption: Math.round(consumption),
      gridFeedIn: Math.round(gridFeedIn),
      todayProduction: Math.round(todayProduction * 10) / 10,
      todayEarnings: Math.round(todayEarnings * 100) / 100,
      batteryLevel: flow.STORAGE?.chargeLevel,
      panelCount: 14, // update with actual count from SolarEdge portal if needed
    };
  } catch {
    return null;
  }
}

function sumMeterValues(
  meter: EnergyDetailsResponse['energyDetails']['meters'][0] | undefined
): number {
  if (!meter) return 0;
  return meter.values.reduce((sum, v) => sum + (v.value ?? 0), 0);
}

function todayStartIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return formatSEDate(d);
}

function nowIso(): string {
  return formatSEDate(new Date());
}

function formatSEDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}
