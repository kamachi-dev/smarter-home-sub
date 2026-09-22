import { NextResponse } from 'next/server';
import { SensorEngine } from '../../lib/sensors/sensorEngine';
import { SupabaseRealtimeSyncDaemon } from '../../lib/sync/supabaseRealtimeSync';

export async function GET() {
  const engine = SensorEngine.getInstance();
  const sync = SupabaseRealtimeSyncDaemon.getInstance();

  const readings = await engine.readAllSensors();
  const status = sync.getStatus();

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    readingsCount: readings.length,
    readings,
    realtimeSyncStatus: status,
  });
}

export async function POST() {
  try {
    const engine = SensorEngine.getInstance();
    const sync = SupabaseRealtimeSyncDaemon.getInstance();

    const readings = await engine.readAllSensors();
    const transmitted = await sync.transmitTelemetry(readings);

    return NextResponse.json({
      success: transmitted,
      timestamp: new Date().toISOString(),
      transmittedReadingsCount: readings.length,
      realtimeStatus: sync.getStatus(),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
