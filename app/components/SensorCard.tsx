'use client';

import React from 'react';
import { SensorConfig, TelemetryReading } from '../lib/types/sensor';
import { Thermometer, Zap, Camera, Activity, Globe, CircuitBoard, Trash2 } from 'lucide-react';

interface Props {
  sensor: SensorConfig;
  reading?: TelemetryReading;
  onDelete?: (id: string) => void;
}

export function SensorCard({ sensor, reading, onDelete }: Props) {
  const isGpio = sensor.transport === 'gpio';

  const renderIcon = () => {
    switch (sensor.type) {
      case 'temperature':
        return <Thermometer className=" w-5 h-5 text-amber-400\ />;
 case 'relay':
 return <Zap className=\w-5 h-5 text-emerald-400\ />;
 case 'camera':
 return <Camera className=\w-5 h-5 text-cyan-400\ />;
 default:
 return <Activity className=\w-5 h-5 text-purple-400\ />;
 }
 };

 const formattedValue = () => {
 if (!reading) return 'Sampling...';
 if (typeof reading.value === 'object') {
 return JSON.stringify(reading.value);
 }
 return ${reading.value};
 };

 return (
 <div className=\glass-card p-5 transition-all hover:border-slate-700\>
 <div className=\flex items-start justify-between mb-3\>
 <div className=\flex items-center gap-3\>
 <div className=\p-2.5 rounded-lg bg-slate-800 border border-slate-700\>
 {renderIcon()}
 </div>
 <div>
 <h4 className=\font-semibold text-slate-100 text-sm\>{sensor.name}</h4>
 <p className=\text-xs text-slate-400\>Room: {sensor.roomId || 'Unassigned'}</p>
 </div>
 </div>

 <div className=\flex items-center gap-2\>
 <span className={px-2.5 py-1 text-xs rounded-full font-medium flex items-center gap-1 }>
 {isGpio ? <CircuitBoard className=\w-3 h-3\ /> : <Globe className=\w-3 h-3\ />}
 {isGpio ? GPIO : IP: }
 </span>
 {onDelete && (
 <button
 onClick={() => onDelete(sensor.id)}
 className=\p-1 text-slate-500 hover:text-rose-400 transition-colors rounded\
 title=\Unregister Sensor\
 >
 <Trash2 className=\w-4 h-4\ />
 </button>
 )}
 </div>
 </div>

 <div className=\mt-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between\>
 <span className=\text-xs text-slate-400 font-medium\>Latest Value:</span>
 <span className=\text-sm font-mono font-semibold text-emerald-300\>{formattedValue()}</span>
 </div>
 </div>
 );
}
