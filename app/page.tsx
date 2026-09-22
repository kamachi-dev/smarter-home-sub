'use client';

import React, { useState, useEffect } from 'react';
import { SubControllerDevice, SensorConfig, TelemetryReading } from './lib/types/sensor';
import { SubControllerCard } from './components/SubControllerCard';
import { SensorCard } from './components/SensorCard';
import { AddSensorModal } from './components/AddSensorModal';
import { Radio, CircuitBoard, Globe, RefreshCw, Plus, Cpu, Activity, Send } from 'lucide-react';

export default function SubControllerDashboard() {
  const [devices, setDevices] = useState<SubControllerDevice[]>([]);
  const [sensors, setSensors] = useState<SensorConfig[]>([]);
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [devRes, sensRes, telemRes] = await Promise.all([
        fetch('/api/devices').then((r) => r.json()),
        fetch('/api/sensors').then((r) => r.json()),
        fetch('/api/telemetry').then((r) => r.json()),
      ]);

      if (devRes.success) setDevices(devRes.devices || []);
      if (sensRes.success) setSensors(sensRes.sensors || []);
      if (telemRes.success) setReadings(telemRes.readings || []);

      addLog([System] Refreshed status:  sensors,  sub-controllers online.);
    } catch (err) {
      addLog([Error] Failed to fetch sub-controller telemetry: );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(timer);
  }, []);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [[] , ...prev.slice(0, 15)]);
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    addLog('[Realtime] Transmitting dual GPIO & IP sensor readings to Supabase Realtime channel...');
    try {
      const res = await fetch('/api/telemetry', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addLog([Realtime] Successfully transmitted  readings to Supabase!);
      } else {
        addLog([Realtime Error] );
      }
    } catch (err) {
      addLog([Error] Sync request failed: );
    } finally {
      setSyncing(false);
    }
  };

  const handleAddSensor = async (sensorData: any) => {
    try {
      const res = await fetch('/api/sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensorData),
      });
      const data = await res.json();
      if (data.success) {
        addLog([Sensor Added]  ());
        fetchDashboardData();
      }
    } catch (err) {
      addLog([Error] Failed to register sensor: );
    }
  };

  const handleDeleteSensor = async (id: string) => {
    try {
      const res = await fetch(/api/sensors?id=, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addLog([Sensor Removed] Unregistered );
        fetchDashboardData();
      }
    } catch (err) {
      addLog([Error] Delete failed: );
    }
  };

  return (
    <main className=" max-w-7xl mx-auto p-4 md:p-8 space-y-8\>
 {/* Header Bar */}
 <header className=\glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20\>
 <div>
 <div className=\flex items-center gap-3\>
 <div className=\p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30\>
 <Cpu className=\w-6 h-6\ />
 </div>
 <div>
 <h1 className=\text-2xl font-bold text-slate-100 tracking-tight\>Smarter Home Sub-Controller</h1>
 <p className=\text-xs text-slate-400\>Next.js + Supabase Realtime Telemetry Daemon</p>
 </div>
 </div>
 </div>

 <div className=\flex flex-wrap items-center gap-3\>
 <span className=\px-3 py-1.5 rounded-full text-xs font-semibold badge-mdns flex items-center gap-1.5\>
 <Radio className=\w-3.5 h-3.5 animate-pulse\ /> mDNS Discovery Active
 </span>
 <span className=\px-3 py-1.5 rounded-full text-xs font-semibold badge-gpio flex items-center gap-1.5\>
 <CircuitBoard className=\w-3.5 h-3.5\ /> Dual GPIO / IP Support
 </span>
 <button
 onClick={handleTriggerSync}
 disabled={syncing}
 className=\px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/30 disabled:opacity-50\
 >
 <Send className={w-3.5 h-3.5 } />
 {syncing ? 'Syncing...' : 'Sync to Supabase Realtime'}
 </button>
 </div>
 </header>

 {/* Discovered Sub-Controllers Section */}
 <section className=\space-y-4\>
 <div className=\flex items-center justify-between\>
 <h2 className=\text-lg font-semibold text-slate-100 flex items-center gap-2\>
 <Radio className=\w-5 h-5 text-cyan-400\ /> Differentiated Sub-Controllers ({devices.length})
 </h2>
 <span className=\text-xs text-slate-400 font-mono\>Auto-Discovered via mDNS / Presence</span>
 </div>

 <div className=\grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\>
 {devices.map((device) => (
 <SubControllerCard key={device.deviceId} device={device} />
 ))}
 </div>
 </section>

 {/* Sensor Management Section */}
 <section className=\space-y-4\>
 <div className=\flex items-center justify-between\>
 <h2 className=\text-lg font-semibold text-slate-100 flex items-center gap-2\>
 <Globe className=\w-5 h-5 text-emerald-400\ /> Dual Sensor Configuration ({sensors.length})
 </h2>
 <button
 onClick={() => setIsModalOpen(true)}
 className=\px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-all\
 >
 <Plus className=\w-4 h-4\ /> Add Sensor (GPIO / IP)
 </button>
 </div>

 <div className=\grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\>
 {sensors.map((sensor) => {
 const reading = readings.find((r) => r.sensorId === sensor.id);
 return (
 <SensorCard
 key={sensor.id}
 sensor={sensor}
 reading={reading}
 onDelete={handleDeleteSensor}
 />
 );
 })}
 </div>
 </section>

 {/* Live Event Console */}
 <section className=\glass-card p-5 space-y-3 border-slate-800\>
 <div className=\flex items-center justify-between pb-2 border-b border-slate-800\>
 <h3 className=\text-sm font-semibold text-slate-200 flex items-center gap-2\>
 <Activity className=\w-4 h-4 text-cyan-400\ /> Telemetry Broadcast Console
 </h3>
 <button onClick={fetchDashboardData} className=\text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1\>
 <RefreshCw className={w-3.5 h-3.5 } /> Refresh
 </button>
 </div>

 <div className=\bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-300 h-44 overflow-y-auto space-y-1.5 border border-slate-900\>
 {logs.length === 0 ? (
 <p className=\text-slate-600 italic\>Listening for sub-controller sensor telemetry events...</p>
 ) : (
 logs.map((log, idx) => (
 <p key={idx} className={log.includes('Error') ? 'text-rose-400' : (log.includes('Realtime') ? 'text-cyan-300' : 'text-slate-300')}>
 {log}
 </p>
 ))
 )}
 </div>
 </section>

 {/* Modal */}
 <AddSensorModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onAddSensor={handleAddSensor}
 />
 </main>
 );
}
