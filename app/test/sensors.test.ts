import { describe, it, expect, beforeEach } from 'vitest';
import { SensorEngine } from '../lib/sensors/sensorEngine';
import { GpioAdapter } from '../lib/sensors/gpioAdapter';
import { IpAdapter } from '../lib/sensors/ipAdapter';

describe('Dual Sensor Engine (GPIO & IP)', () => {
  let engine: SensorEngine;

  beforeEach(() => {
    engine = SensorEngine.getInstance();
  });

  it('should register and read local GPIO pin sensors', async () => {
    const config = {
      id: 'test-gpio-sensor',
      name: 'Test GPIO Sensor',
      type: 'temperature' as const,
      transport: 'gpio' as const,
      gpioConfig: { pin: 22 },
      enabled: true,
    };

    engine.registerSensor(config);
    const reading = await engine.readSensor('test-gpio-sensor');

    expect(reading).not.toBeNull();
    expect(reading?.sensorId).toBe('test-gpio-sensor');
    expect(reading?.transport).toBe('gpio');
    expect(typeof reading?.value).toBe('number');
  });

  it('should register and read network IP-address sensors', async () => {
    const config = {
      id: 'test-ip-sensor',
      name: 'Test Network IP Sensor',
      type: 'temperature' as const,
      transport: 'ip' as const,
      ipConfig: { ipAddress: '192.168.1.210', port: 80, endpoint: '/api/v1/temp' },
      enabled: true,
    };

    engine.registerSensor(config);
    const reading = await engine.readSensor('test-ip-sensor');

    expect(reading).not.toBeNull();
    expect(reading?.sensorId).toBe('test-ip-sensor');
    expect(reading?.transport).toBe('ip');
    expect(reading?.value).toBeDefined();
  });

  it('should allow writing state to GPIO pins (relays)', async () => {
    const pinWritten = await GpioAdapter.writeGpioPin(17, true);
    expect(pinWritten).toBe(true);
    expect(GpioAdapter.getPinState(17)).toBe(true);
  });

  it('should include room and roomName in sensor readings for dashboard telemetry', async () => {
    engine.assignRoomPin('room-study', 'temp_gpio', 27, 'Study Room');
    const reading = await engine.readSensor('sensor-gpio-temp_gpio-room-study');

    expect(reading).not.toBeNull();
    expect(reading?.roomId).toBe('room-study');
    expect(reading?.room).toBe('Study Room');
  });

  it('should update relay state when actuation command is received', async () => {
    engine.assignRoomPin('room-kitchen', 'light_gpio', 18, 'Kitchen');
    const updated = await engine.updateRelayState('sensor-gpio-light_gpio-room-kitchen', true);

    expect(updated).toBe(true);
    expect(GpioAdapter.getPinState(18)).toBe(true);

    const turnedOff = await engine.updateRelayState('sensor-gpio-light_gpio-room-kitchen', false);
    expect(turnedOff).toBe(true);
    expect(GpioAdapter.getPinState(18)).toBe(false);
  });
});
