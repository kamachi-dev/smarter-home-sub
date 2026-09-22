import { GpioConfig, TelemetryReading, SensorConfig } from '../types/sensor';

export class GpioAdapter {
  private static virtualState: Map<number, boolean | number> = new Map();

  public static async readGpio(config: SensorConfig, deviceId: string): Promise<TelemetryReading> {
    const gpioCfg = config.gpioConfig || { pin: 4 };
    const pin = gpioCfg.pin;
    
    let rawValue: boolean | number;
    if (this.virtualState.has(pin)) {
      rawValue = this.virtualState.get(pin)!;
    } else {
      if (config.type === 'temperature') {
        rawValue = Number((20 + Math.random() * 5).toFixed(1));
      } else if (config.type === 'humidity') {
        rawValue = Number((45 + Math.random() * 15).toFixed(1));
      } else if (config.type === 'relay') {
        rawValue = false;
      } else {
        rawValue = true;
      }
      this.virtualState.set(pin, rawValue);
    }

    if (gpioCfg.activeLow && typeof rawValue === 'boolean') {
      rawValue = !rawValue;
    }

    let unit = '';
    if (config.type === 'temperature') unit = '°C';
    else if (config.type === 'humidity') unit = '%';

    return {
      sensorId: config.id,
      sensorName: config.name,
      type: config.type,
      transport: 'gpio',
      value: rawValue,
      unit,
      timestamp: new Date().toISOString(),
      deviceId,
      roomId: config.roomId,
    };
  }

  public static async writeGpioPin(pin: number, value: boolean): Promise<boolean> {
    this.virtualState.set(pin, value);
    return true;
  }

  public static getPinState(pin: number): boolean | number | undefined {
    return this.virtualState.get(pin);
  }
}
