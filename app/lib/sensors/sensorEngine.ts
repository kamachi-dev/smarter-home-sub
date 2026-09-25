import { SensorConfig, TelemetryReading } from '../types/sensor';
import { GpioAdapter } from './gpioAdapter';
import { IpAdapter } from './ipAdapter';
import { subConfig } from '../config/env';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface RoomPinAssignment {
  roomId: string;
  roomName?: string;
  property: 'light_gpio' | 'temp_gpio' | 'ac_gpio';
  pin: number | null;
}

export class SensorEngine {
  private static instance: SensorEngine;
  private sensors: Map<string, SensorConfig> = new Map();
  private deviceId: string = subConfig.deviceId;
  private supabase: SupabaseClient | null = null;
  private assignments: RoomPinAssignment[] = [];

  private constructor() {
    this.initSupabase();
    this.registerDefaultSensors();
  }

  public static getInstance(): SensorEngine {
    if (!SensorEngine.instance) {
      SensorEngine.instance = new SensorEngine();
    }
    return SensorEngine.instance;
  }

  private initSupabase(): void {
    if (subConfig.supabaseUrl && subConfig.supabaseKey) {
      try {
        this.supabase = createClient(subConfig.supabaseUrl, subConfig.supabaseKey);
      } catch (err) {
        console.warn('[SensorEngine] Supabase init warning:', (err as Error).message);
      }
    }
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

  /**
   * Sync sensor GPIO pins and room associations from Supabase rooms table.
   */
  public async syncFromSupabase(): Promise<boolean> {
    if (!this.supabase) return false;

    try {
      const { data: rooms, error } = await this.supabase
        .from('rooms')
        .select('id, name, light_gpio, temp_gpio, ac_gpio');

      if (error || !Array.isArray(rooms)) return false;

      const newAssignments: RoomPinAssignment[] = [];

      for (const room of rooms) {
        if (room.temp_gpio !== null && room.temp_gpio !== undefined) {
          const sensorId = `sensor-gpio-temp-${room.id}`;
          this.registerSensor({
            id: sensorId,
            name: `${room.name} Temperature (GPIO ${room.temp_gpio})`,
            type: 'temperature',
            transport: 'gpio',
            gpioConfig: { pin: Number(room.temp_gpio) },
            roomId: room.id,
            pollIntervalMs: 3000,
            enabled: true,
          });
          newAssignments.push({
            roomId: room.id,
            roomName: room.name,
            property: 'temp_gpio',
            pin: Number(room.temp_gpio),
          });
        }

        if (room.light_gpio !== null && room.light_gpio !== undefined) {
          const sensorId = `sensor-gpio-relay-${room.id}`;
          this.registerSensor({
            id: sensorId,
            name: `${room.name} Light Relay (GPIO ${room.light_gpio})`,
            type: 'relay',
            transport: 'gpio',
            gpioConfig: { pin: Number(room.light_gpio), direction: 'out' },
            roomId: room.id,
            pollIntervalMs: 5000,
            enabled: true,
          });
          newAssignments.push({
            roomId: room.id,
            roomName: room.name,
            property: 'light_gpio',
            pin: Number(room.light_gpio),
          });
        }
      }

      this.assignments = newAssignments;
      return true;
    } catch (err) {
      console.warn('[SensorEngine] Sync warning:', (err as Error).message);
      return false;
    }
  }

  /**
   * Explicitly assign a GPIO pin to a room and sensor type on this controller.
   */
  public assignRoomPin(roomId: string, property: 'light_gpio' | 'temp_gpio' | 'ac_gpio', pin: number | null, roomName?: string): void {
    const existingIdx = this.assignments.findIndex(a => a.roomId === roomId && a.property === property);
    if (existingIdx >= 0) {
      this.assignments[existingIdx].pin = pin;
      if (roomName) this.assignments[existingIdx].roomName = roomName;
    } else {
      this.assignments.push({ roomId, roomName, property, pin });
    }

    const sensorType = property === 'temp_gpio' ? 'temperature' : property === 'light_gpio' ? 'relay' : 'custom';
    const sensorId = `sensor-gpio-${property}-${roomId}`;

    if (pin === null) {
      this.unregisterSensor(sensorId);
    } else {
      this.registerSensor({
        id: sensorId,
        name: `${roomName || roomId} ${property} (GPIO ${pin})`,
        type: sensorType,
        transport: 'gpio',
        gpioConfig: { pin, direction: property === 'light_gpio' ? 'out' : 'in' },
        roomId,
        pollIntervalMs: 3000,
        enabled: true,
      });
    }
  }

  public getAssignments(): RoomPinAssignment[] {
    return [...this.assignments];
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
