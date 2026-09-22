import { describe, it, expect, beforeEach } from 'vitest';
import { DeviceDiscoveryEngine } from '../lib/discovery/deviceDiscovery';

describe('Sub-Controller Device Discovery (mDNS & Presence)', () => {
  let discovery: DeviceDiscoveryEngine;

  beforeEach(() => {
    discovery = DeviceDiscoveryEngine.getInstance();
  });

  it('should return local sub-controller node info', () => {
    const local = discovery.getLocalDevice();
    expect(local).toBeDefined();
    expect(local.deviceId).toBe('sub-ctrl-node-primary');
    expect(local.ipAddress).toBeDefined();
  });

  it('should differentiate sub-controllers cleanly without manual IP configuration', async () => {
    const devices = await discovery.scanNetworkMdns();
    expect(devices.length).toBeGreaterThan(0);

    const garageNode = discovery.getDeviceById('sub-ctrl-node-garage');
    expect(garageNode).toBeDefined();
    expect(garageNode?.macAddress).toBe('cc:50:e3:9a:11:4f');
    expect(garageNode?.transport).toBe('mdns');
  });

  it('should register a newly discovered sub-controller device dynamically', () => {
    const newDevice = {
      deviceId: 'sub-ctrl-node-attic',
      name: 'Attic Sub Controller',
      ipAddress: '192.168.1.189',
      port: 3000,
      status: 'online' as const,
      lastSeen: new Date().toISOString(),
      sensorsCount: 1,
      transport: 'mdns' as const,
      capabilities: ['gpio', 'temperature'],
    };

    discovery.registerDevice(newDevice);
    const retrieved = discovery.getDeviceById('sub-ctrl-node-attic');

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Attic Sub Controller');
  });
});
