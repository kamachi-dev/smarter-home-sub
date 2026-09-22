export type TransportType = 'gpio' | 'ip' | 'mdns';

export type SensorType = 'temperature' | 'humidity' | 'relay' | 'camera' | 'presence' | 'custom';

export interface GpioConfig {
  pin: number;
  direction?: 'in' | 'out';
  activeLow?: boolean;
}

export interface IpConfig {
  ipAddress: string;
  port?: number;
  endpoint?: string;
  authHeader?: string;
  protocol?: 'http' | 'https' | 'rtsp';
}

export interface MdnsConfig {
  serviceName: string;
  deviceUuid: string;
  txtRecord?: Record<string, string>;
}

export interface SensorConfig {
  id: string;
  name: string;
  type: SensorType;
  transport: TransportType;
  gpioConfig?: GpioConfig;
  ipConfig?: IpConfig;
  mdnsConfig?: MdnsConfig;
  roomId?: string;
  pollIntervalMs?: number;
  enabled: boolean;
  metadata?: Record<string, any>;
}

export interface TelemetryReading {
  sensorId: string;
  sensorName: string;
  type: SensorType;
  transport: TransportType;
  value: number | boolean | string | Record<string, any>;
  unit?: string;
  timestamp: string;
  deviceId: string;
  roomId?: string;
}

export interface SubControllerDevice {
  deviceId: string;
  name: string;
  ipAddress: string;
  port: number;
  macAddress?: string;
  status: 'online' | 'offline';
  lastSeen: string;
  sensorsCount: number;
  transport: 'mdns' | 'supabase_presence';
  capabilities: string[];
  metadata?: Record<string, any>;
}

export interface RealtimeSyncStatus {
  connected: boolean;
  channelName: string;
  lastSyncTime: string | null;
  totalBroadcasts: number;
  lastError: string | null;
}
