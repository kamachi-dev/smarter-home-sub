import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { TelemetryReading, RealtimeSyncStatus, SubControllerDevice } from '../types/sensor';

export class SupabaseRealtimeSyncDaemon {
  private static instance: SupabaseRealtimeSyncDaemon;
  private supabase: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private status: RealtimeSyncStatus = {
    connected: false,
    channelName: 'smarter-home:telemetry',
    lastSyncTime: null,
    totalBroadcasts: 0,
    lastError: null,
  };

  private constructor() {
    this.initSupabaseClient();
  }

  public static getInstance(): SupabaseRealtimeSyncDaemon {
    if (!SupabaseRealtimeSyncDaemon.instance) {
      SupabaseRealtimeSyncDaemon.instance = new SupabaseRealtimeSyncDaemon();
    }
    return SupabaseRealtimeSyncDaemon.instance;
  }

  private initSupabaseClient(): void {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.subscribeRealtimeChannel();
      } catch (err) {
        this.status.lastError = (err as Error).message;
      }
    } else {
      this.status.lastError = 'Missing Supabase environment configuration. Operating in broadcast mock mode.';
    }
  }

  private subscribeRealtimeChannel(): void {
    if (!this.supabase) return;

    try {
      this.channel = this.supabase.channel(this.status.channelName, {
        config: { broadcast: { self: true } },
      });

      this.channel
        .on('broadcast', { event: 'sensor_command' }, (payload) => {
          console.log('[SupabaseSync] Incoming sensor command:', payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.status.connected = true;
            this.status.lastError = null;
          } else {
            this.status.connected = false;
          }
        });
    } catch (err) {
      this.status.lastError = (err as Error).message;
    }
  }

  public async transmitTelemetry(readings: TelemetryReading[]): Promise<boolean> {
    const isoNow = new Date().toISOString();
    this.status.lastSyncTime = isoNow;
    this.status.totalBroadcasts += readings.length;

    if (this.channel && this.status.connected) {
      await this.channel.send({
        type: 'broadcast',
        event: 'sensor_readings',
        payload: { readings, timestamp: isoNow },
      }).catch(() => {});
    }

    if (this.supabase) {
      try {
        const rows = readings.map((r) => ({
          sensor_id: r.sensorId,
          device_id: r.deviceId,
          type: r.type,
          transport: r.transport,
          value: typeof r.value === 'object' ? JSON.stringify(r.value) : String(r.value),
          unit: r.unit || null,
          created_at: r.timestamp,
        }));
        await this.supabase.from('sensor_telemetry').insert(rows).catch(() => {});

        for (const r of readings) {
          if (r.roomId) {
            const updates: Record<string, any> = { updated_at: isoNow };
            if (r.type === 'temperature' && typeof r.value === 'number') {
              updates.temperature = r.value;
            } else if (r.type === 'humidity' && typeof r.value === 'number') {
              updates.humidity = r.value;
            } else if (r.type === 'relay' && typeof r.value === 'boolean') {
              updates.lights_power = r.value;
            }
            await this.supabase.from('rooms').update(updates).eq('id', r.roomId).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('[SupabaseSync] Postgres update notice:', (err as Error).message);
      }
    }

    return true;
  }

  public async broadcastDevicePresence(device: SubControllerDevice): Promise<boolean> {
    if (this.channel && this.status.connected) {
      await this.channel.send({
        type: 'broadcast',
        event: 'sub_controller_presence',
        payload: { device, timestamp: new Date().toISOString() },
      }).catch(() => {});
    }
    return true;
  }

  public getStatus(): RealtimeSyncStatus {
    return { ...this.status };
  }
}
