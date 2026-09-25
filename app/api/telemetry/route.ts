import { NextResponse } from 'next/server';
import { SensorEngine } from '../../lib/sensors/sensorEngine';
import { MqttTransmitterDaemon } from '../../lib/sync/mqttTransmitter';

export async function GET() {
  const engine = SensorEngine.getInstance();
  const mqttSync = MqttTransmitterDaemon.getInstance();

  const readings = await engine.readAllSensors();
  const status = mqttSync.getStatus();

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    readingsCount: readings.length,
    readings,
    mqttSyncStatus: status,
  });
}

export async function POST() {
  try {
    const engine = SensorEngine.getInstance();
    const mqttSync = MqttTransmitterDaemon.getInstance();

    const readings = await engine.readAllSensors();
    const transmitted = await mqttSync.transmitTelemetry(readings);

    return NextResponse.json({
      success: transmitted,
      timestamp: new Date().toISOString(),
      transmittedReadingsCount: readings.length,
      mqttStatus: mqttSync.getStatus(),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
