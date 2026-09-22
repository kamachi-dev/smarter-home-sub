import { SensorConfig, TelemetryReading } from '../types/sensor';
import { GpioAdapter } from './gpioAdapter';
import { IpAdapter } from './ipAdapter';

export class SensorEngine {
  private static instance: SensorEngine;
  private sensors: Map<string, SensorConfig> = new Map();
  private deviceId: string = 'sub-controller-node-01';

  private constructor() {
    this.registerDefaultSensors();
  }

  public static getInstance(): SensorEngine {
    if (!SensorEngine.instance) {
      SensorEngine.instance = new SensorEngine();
    }
    return SensorEngine.instance;
  }

  private registerDefaultSensors(): void {
    this.registerSensor({
      id: 'sensor-gpio-temp-1',
      name: 'Living Room DHT22 Temp (GPIO 4)',
      type: 'temperature',
      transport: 'gpio',
      gpioConfig: { pin: 4 },
      roomId: 'room-living-room',
      pollIntervalMs: 5000,
      enabled: true,
    });

    this.registerSensor({
      id: 'sensor-gpio-relay-1',
      name: 'Main Light Relay (GPIO 17)',
      type: 'relay',
      transport: 'gpio',
      gpioConfig: { pin: 17, direction: 'out' },
      roomId: 'room-living-room',
      pollIntervalMs: 5000,
      enabled: true,
    });

    this.registerSensor({
      id: 'sensor-ip-temp-node',
      name: 'Balcony ESP32 Temp Sensor (IP 192.168.1.120)',
      type: 'temperature',
      transport: 'ip',
      ipConfig: { ipAddress: '192.168.1.120', port: 80, endpoint: '/api/v1/temperature' },
      roomId: 'room-balcony',
      pollIntervalMs: 3000,
      enabled: true,
    });

    this.registerSensor({
      id: 'sensor-ip-tapo-cam',
      name: 'Driveway Tapo Camera (IP 192.168.1.150)',
      type: 'camera',
      transport: 'ip',
      ipConfig: { ipAddress: '192.168.1.150', port: 554, protocol: 'rtsp' },
      roomId: 'room-driveway',
      pollIntervalMs: 10000,
      enabled: true,
    });
  }

  public registerSensor(config: SensorConfig): void {
    this.sensors.set(config.id, config);
  }

  public unregisterSensor(id: string): boolean {
    return this.sensors.delete(id);
  }

  public getSensor(id: string): SensorConfig | undefined {
    return this.sensors.get(id);
  }

  public getAllSensors(): SensorConfig[] {
    return Array.from(this.sensors.values());
  }

  public setDeviceId(id: string): void {
    this.deviceId = id;
  }

  public getDeviceId(): string {
    return this.deviceId;
  }

  public async readSensor(id: string): Promise<TelemetryReading | null> {
    const config = this.sensors.get(id);
    if (!config || !config.enabled) return null;

    if (config.transport === 'gpio') {
      return GpioAdapter.readGpio(config, this.deviceId);
    } else if (config.transport === 'ip') {
      return IpAdapter.readIpSensor(config, this.deviceId);
    }

    return {
      sensorId: config.id,
      sensorName: config.name,
      type: config.type,
      transport: config.transport,
      value: 'active',
      timestamp: new Date().toISOString(),
      deviceId: this.deviceId,
      roomId: config.roomId,
    };
  }

  public async readAllSensors(): Promise<TelemetryReading[]> {
    const activeSensors = this.getAllSensors().filter(s => s.enabled);
    const readings: TelemetryReading[] = [];

    for (const sensor of activeSensors) {
      const reading = await this.readSensor(sensor.id);
      if (reading) readings.push(reading);
    }

    return readings;
  }

  public async updateRelayState(sensorId: string, power: boolean): Promise<boolean> {
    const config = this.sensors.get(sensorId);
    if (!config) return false;

    if (config.transport === 'gpio' && config.gpioConfig) {
      return GpioAdapter.writeGpioPin(config.gpioConfig.pin, power);
    }
    return true;
  }
}
