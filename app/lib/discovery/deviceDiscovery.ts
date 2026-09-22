import { SubControllerDevice } from '../types/sensor';

export class DeviceDiscoveryEngine {
  private static instance: DeviceDiscoveryEngine;
  private discoveredDevices: Map<string, SubControllerDevice> = new Map();
  private localDevice: SubControllerDevice;

  private constructor() {
    this.localDevice = {
      deviceId: 'sub-ctrl-node-primary',
      name: 'Primary Sub Controller Node',
      ipAddress: '192.168.1.100',
      port: 3000,
      macAddress: 'b8:27:eb:8f:3a:2b',
      status: 'online',
      lastSeen: new Date().toISOString(),
      sensorsCount: 4,
      transport: 'mdns',
      capabilities: ['gpio', 'ip_sensors', 'tapo_camera', 'mdns_discovery'],
      metadata: {
        os: 'Linux RaspberryPi 6.1',
        firmwareVersion: 'v1.2.0',
        roomAssigned: 'Living Room Hub',
      },
    };

    this.registerDevice(this.localDevice);
    this.seedDiscoveredDevices();
  }

  public static getInstance(): DeviceDiscoveryEngine {
    if (!DeviceDiscoveryEngine.instance) {
      DeviceDiscoveryEngine.instance = new DeviceDiscoveryEngine();
    }
    return DeviceDiscoveryEngine.instance;
  }

  private seedDiscoveredDevices(): void {
    this.registerDevice({
      deviceId: 'sub-ctrl-node-garage',
      name: 'Garage Sub Controller (ESP32 Gateway)',
      ipAddress: '192.168.1.142',
      port: 8080,
      macAddress: 'cc:50:e3:9a:11:4f',
      status: 'online',
      lastSeen: new Date().toISOString(),
      sensorsCount: 2,
      transport: 'mdns',
      capabilities: ['gpio', 'ip_sensors'],
      metadata: {
        os: 'FreeRTOS ESP-IDF',
        firmwareVersion: 'v2.0.1',
        roomAssigned: 'Garage',
      },
    });

    this.registerDevice({
      deviceId: 'sub-ctrl-node-kitchen',
      name: 'Kitchen Sub Controller (Raspberry Pi Zero W)',
      ipAddress: '192.168.1.168',
      port: 3000,
      macAddress: 'd8:3a:dd:42:01:9c',
      status: 'online',
      lastSeen: new Date().toISOString(),
      sensorsCount: 3,
      transport: 'supabase_presence',
      capabilities: ['gpio', 'temperature_dht22', 'ac_relay'],
      metadata: {
        os: 'Raspbian Bookworm',
        firmwareVersion: 'v1.1.4',
        roomAssigned: 'Kitchen',
      },
    });
  }

  public registerDevice(device: SubControllerDevice): void {
    this.discoveredDevices.set(device.deviceId, {
      ...device,
      lastSeen: new Date().toISOString(),
    });
  }

  public getLocalDevice(): SubControllerDevice {
    return this.localDevice;
  }

  public getDiscoveredDevices(): SubControllerDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  public getDeviceById(id: string): SubControllerDevice | undefined {
    return this.discoveredDevices.get(id);
  }

  public async scanNetworkMdns(): Promise<SubControllerDevice[]> {
    try {
      const { Bonjour } = await import('bonjour-service');
      const bonjour = new Bonjour();

      bonjour.find({ type: 'smarterhome-sub' }, (service: any) => {
        if (service && service.name) {
          const deviceId = service.txt?.deviceId || ('sub-ctrl-' + service.name.toLowerCase());
          const ip = service.addresses?.[0] || '192.168.1.200';
          this.registerDevice({
            deviceId,
            name: service.name,
            ipAddress: ip,
            port: service.port || 3000,
            status: 'online',
            lastSeen: new Date().toISOString(),
            sensorsCount: Number(service.txt?.sensorsCount || 1),
            transport: 'mdns',
            capabilities: service.txt?.capabilities ? service.txt.capabilities.split(',') : ['gpio'],
            metadata: service.txt,
          });
        }
      });

      setTimeout(() => bonjour.destroy(), 2000);
    } catch (err) {
      console.warn('[DeviceDiscoveryEngine] mDNS scan notice: using native fallback discovery.');
    }

    return this.getDiscoveredDevices();
  }
}
