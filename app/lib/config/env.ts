export interface SubControllerConfig {
  supabaseUrl: string;
  supabaseKey: string;
  mqttBrokerUrl: string;
  homeToken: string;
  deviceId: string;
  pollIntervalMs: number;
}

export const subConfig: SubControllerConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://qsgcngbfyjmehffywazp.supabase.co',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_hM0IB67_FlZTtzXtv7ZTMQ_vmlweXBw',
  mqttBrokerUrl: process.env.PI_MQTT_BROKER_URL || process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  homeToken: process.env.SMARTER_HOME_TOKEN || 'smp_live_9eae54cbc18f4c1787ee94c6875301aa096d0063040b3b01',
  deviceId: process.env.SUB_CONTROLLER_ID || 'sub-ctrl-node-01',
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '3000', 10),
};
