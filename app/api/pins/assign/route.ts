import { NextResponse } from 'next/server';
import { SensorEngine } from '../../../lib/sensors/sensorEngine';

export async function GET() {
  const engine = SensorEngine.getInstance();
  return NextResponse.json({
    success: true,
    assignments: engine.getAssignments(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, property, pin, roomName } = body;

    if (!roomId || !property) {
      return NextResponse.json(
        { success: false, error: 'roomId and property (light_gpio | temp_gpio | ac_gpio) are required.' },
        { status: 400 }
      );
    }

    const engine = SensorEngine.getInstance();
    const pinNumber = pin !== null && pin !== undefined ? Number(pin) : null;
    engine.assignRoomPin(roomId, property, pinNumber, roomName);

    return NextResponse.json({
      success: true,
      message: `Assigned ${property} to GPIO ${pinNumber} for room ${roomId}`,
      assignments: engine.getAssignments(),
      sensors: engine.getAllSensors(),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
