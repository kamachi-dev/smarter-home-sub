import { NextResponse } from 'next/server';
import { DeviceDiscoveryEngine } from '../../lib/discovery/deviceDiscovery';
import { SubControllerDevice } from '../../lib/types/sensor';

export async function GET() {
  const discovery = DeviceDiscoveryEngine.getInstance();
  const devices = await discovery.scanNetworkMdns();
  const local = discovery.getLocalDevice();

  return NextResponse.json({
    success: true,
    count: devices.length,
    localDevice: local,
    devices,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<SubControllerDevice>;
    if (!body.deviceId || !body.name || !body.ipAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required device fields: deviceId, name, ipAddress' },
        { status: 400 }
      );
    }

    const device: SubControllerDevice = {
      deviceId: body.deviceId,
      name: body.name,
      ipAddress: body.ipAddress,
      port: body.port || 3000,
      macAddress: body.macAddress,
      status: body.status || 'online',
      lastSeen: new Date().toISOString(),
      sensorsCount: body.sensorsCount || 0,
      transport: body.transport || 'mdns',
      capabilities: body.capabilities || ['gpio'],
      metadata: body.metadata,
    };

    const discovery = DeviceDiscoveryEngine.getInstance();
    discovery.registerDevice(device);

    return NextResponse.json({
      success: true,
      device,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
