import { describe, it, expect } from 'vitest';
import { GET as getSensors, POST as postSensors } from '../api/sensors/route';
import { GET as getDevices, POST as postDevices } from '../api/devices/route';
import { GET as getTelemetry, POST as postTelemetry } from '../api/telemetry/route';
import { GET as getPins, POST as postPins } from '../api/pins/assign/route';

describe('Sub-Controller Next.js API Routes', () => {
  it('GET /api/sensors should return registered sensors and readings', async () => {
    const res = await getSensors();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.sensors)).toBe(true);
    expect(Array.isArray(data.readings)).toBe(true);
  });

  it('POST /api/sensors should allow adding IP and GPIO sensors', async () => {
    const req = new Request('http://localhost/api/sensors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bedroom DHT22',
        type: 'temperature',
        transport: 'gpio',
        gpioConfig: { pin: 18 },
      }),
    });

    const res = await postSensors(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.sensor.name).toBe('Bedroom DHT22');
  });

  it('GET /api/devices should list auto-discovered sub-controller nodes', async () => {
    const res = await getDevices();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.localDevice).toBeDefined();
    expect(Array.isArray(data.devices)).toBe(true);
  });

  it('POST /api/telemetry should trigger sensor sampling and MQTT dispatch', async () => {
    const res = await postTelemetry();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(typeof data.transmittedReadingsCount).toBe('number');
  });

  it('POST & GET /api/pins/assign should configure room GPIO pin assignments', async () => {
    const req = new Request('http://localhost/api/pins/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: 'room-master-bedroom',
        roomName: 'Master Bedroom',
        property: 'temp_gpio',
        pin: 22,
      }),
    });

    const postRes = await postPins(req);
    const postData = await postRes.json();
    expect(postRes.status).toBe(200);
    expect(postData.success).toBe(true);

    const getRes = await getPins();
    const getData = await getRes.json();
    expect(getRes.status).toBe(200);
    expect(Array.isArray(getData.assignments)).toBe(true);
    const match = getData.assignments.find((a: any) => a.roomId === 'room-master-bedroom' && a.property === 'temp_gpio');
    expect(match?.pin).toBe(22);
  });
});
