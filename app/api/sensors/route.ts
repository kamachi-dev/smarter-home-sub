import { NextResponse } from 'next/server';
import { SensorEngine } from '../../lib/sensors/sensorEngine';
import { SensorConfig } from '../../lib/types/sensor';

export async function GET() {
  const engine = SensorEngine.getInstance();
  const sensors = engine.getAllSensors();
  const readings = await engine.readAllSensors();

  return NextResponse.json({
    success: true,
    count: sensors.length,
    sensors,
    readings,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<SensorConfig>;
    if (!body.name || !body.type || !body.transport) {
      return NextResponse.json(
        { success: false, error: 'Missing required sensor fields: name, type, transport' },
        { status: 400 }
      );
    }

    const id = body.id || ('sensor-' + body.transport + '-' + Date.now());
    const newSensor: SensorConfig = {
      id,
      name: body.name,
      type: body.type,
      transport: body.transport,
      gpioConfig: body.gpioConfig,
      ipConfig: body.ipConfig,
      mdnsConfig: body.mdnsConfig,
      roomId: body.roomId,
      pollIntervalMs: body.pollIntervalMs || 5000,
      enabled: body.enabled !== false,
      metadata: body.metadata,
    };

    const engine = SensorEngine.getInstance();
    engine.registerSensor(newSensor);
    const reading = await engine.readSensor(id);

    return NextResponse.json({
      success: true,
      sensor: newSensor,
      initialReading: reading,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Query parameter id is required' },
        { status: 400 }
      );
    }

    const engine = SensorEngine.getInstance();
    const removed = engine.unregisterSensor(id);

    return NextResponse.json({
      success: removed,
      message: removed ? ('Sensor ' + id + ' unregistered') : ('Sensor ' + id + ' not found'),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
