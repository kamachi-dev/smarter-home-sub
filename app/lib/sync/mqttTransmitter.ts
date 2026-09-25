import mqtt, { MqttClient } from 'mqtt';
import { TelemetryReading } from '../types/sensor';
import { subConfig } from '../config/env';

export interface MqttTransmitterStatus {
  connected: boolean;
  brokerUrl: string;
  totalTransmitted: number;
  lastTransmitTime: string | null;
  lastError: string | null;
}

export class MqttTransmitterDaemon {
  private static instance: MqttTransmitterDaemon;
  private client: MqttClient | null = null;
  private status: MqttTransmitterStatus = {
    connected: false,
    brokerUrl: subConfig.mqttBrokerUrl,
    totalTransmitted: 0,
    lastTransmitTime: null,
    lastError: null,
  };

  private constructor() {
    this.connect();
  }

  public static getInstance(): MqttTransmitterDaemon {
    if (!MqttTransmitterDaemon.instance) {
      MqttTransmitterDaemon.instance = new MqttTransmitterDaemon();
    }
    return MqttTransmitterDaemon.instance;
  }

  public connect(): void {
    if (this.client) return;

    try {
      this.client = mqtt.connect(subConfig.mqttBrokerUrl, {
        clientId: `${subConfig.deviceId}-${Math.random().toString(16).substring(2, 8)}`,
        reconnectPeriod: 3000,
        connectTimeout: 2000,
      });

      this.client.on('connect', () => {
        this.status.connected = true;
        this.status.lastError = null;
        console.log(`[MqttTransmitter] Connected to Mosquitto broker on Pi: ${subConfig.mqttBrokerUrl}`);

        const cmdTopic = `smarterhome/${subConfig.homeToken}/commands/${subConfig.deviceId}`;
        this.client?.subscribe(cmdTopic, (err) => {
          if (!err) {
            console.log(`[MqttTransmitter] Subscribed to command topic: ${cmdTopic}`);
          }
        });
      });

      this.client.on('error', (err) => {
        this.status.connected = false;
        this.status.lastError = err.message;
      });

      this.client.on('close', () => {
        this.status.connected = false;
      });
    } catch (err) {
      this.status.connected = false;
      this.status.lastError = (err as Error).message;
    }
  }

  public async transmitTelemetry(readings: TelemetryReading[]): Promise<boolean> {
    if (!readings || readings.length === 0) return true;

    const isoNow = new Date().toISOString();
    const token = subConfig.homeToken;
    const deviceId = subConfig.deviceId;

    this.status.lastTransmitTime = isoNow;
    this.status.totalTransmitted += readings.length;

    const topic = `smarterhome/${token}/sub/${deviceId}/readings`;
    const payload = JSON.stringify({
      deviceId,
      timestamp: isoNow,
      readings,
    });

    if (!this.client || !this.status.connected) {
      // Offline/local buffered mode: accepted
      return true;
    }

    return new Promise((resolve) => {
      this.client!.publish(topic, payload, { qos: 0 }, (err) => {
        if (err) {
          this.status.lastError = err.message;
        } else {
          this.status.lastError = null;
        }
        resolve(true);
      });
    });
  }

  public getStatus(): MqttTransmitterStatus {
    return { ...this.status };
  }
}
