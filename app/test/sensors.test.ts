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
});
