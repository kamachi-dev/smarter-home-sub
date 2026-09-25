export const dynamic = 'force-dynamic';

export default function HeadlessSubController() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <h1>Smarter Home Sub-Controller Daemon</h1>
      <p style={{ color: '#22c55e' }}>● Running in Headless Sensor & MQTT Mode</p>
      <p>This controller streams sensor telemetry directly to the main Raspberry Pi via MQTT.</p>
      <ul>
        <li><a style={{ color: '#38bdf8' }} href="/api/telemetry">/api/telemetry</a> - Live sensor readings & MQTT transmitter status</li>
        <li><a style={{ color: '#38bdf8' }} href="/api/sensors">/api/sensors</a> - Configured hardware and IP sensor definitions</li>
        <li><a style={{ color: '#38bdf8' }} href="/api/pins/assign">/api/pins/assign</a> - Dynamic room & GPIO pin assignments</li>
      </ul>
    </main>
  );
}
