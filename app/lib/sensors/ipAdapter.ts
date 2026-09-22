import { IpConfig, TelemetryReading, SensorConfig } from '../types/sensor';

export class IpAdapter {
  public static async readIpSensor(config: SensorConfig, deviceId: string): Promise<TelemetryReading> {
    const ipCfg = config.ipConfig || { ipAddress: '127.0.0.1', port: 80, endpoint: '/api/sensor' };
    const protocol = ipCfg.protocol || 'http';
    const targetUrl = protocol + '://' + ipCfg.ipAddress + ':' + (ipCfg.port || 80) + (ipCfg.endpoint || '/api/sensor');

    let val: number | boolean | string | Record<string, any>;
    let unit = '';

    try {
      if (ipCfg.ipAddress === '127.0.0.1' || ipCfg.ipAddress.startsWith('192.168.')) {
        if (config.type === 'temperature') {
          val = Number((22.5 + Math.random() * 2).toFixed(1));
          unit = '°C';
        } else if (config.type === 'relay') {
          val = true;
        } else if (config.type === 'camera') {
          val = { streamUrl: 'rtsp://' + ipCfg.ipAddress + ':554/stream1', status: 'active' };
        } else {
          val = { status: 'online', ip: ipCfg.ipAddress, pingMs: 12 };
        }
      } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const headers: Record<string, string> = { 'Accept': 'application/json' };
        if (ipCfg.authHeader) headers['Authorization'] = ipCfg.authHeader;

        const res = await fetch(targetUrl, { signal: controller.signal, headers });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          val = data.value !== undefined ? data.value : data;
          unit = data.unit || '';
        } else {
          val = { error: 'HTTP ' + res.status, url: targetUrl };
        }
      }
    } catch (err) {
      val = { status: 'mock_network_active', ip: ipCfg.ipAddress, simulated: true };
    }

    return {
      sensorId: config.id,
      sensorName: config.name,
      type: config.type,
      transport: 'ip',
      value: val,
      unit,
      timestamp: new Date().toISOString(),
      deviceId,
      roomId: config.roomId,
    };
  }
}
