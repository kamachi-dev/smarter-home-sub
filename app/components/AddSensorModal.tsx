'use client';

import React, { useState } from 'react';
import { SensorType, TransportType } from '../lib/types/sensor';
import { X, CircuitBoard, Globe, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddSensor: (sensorData: any) => void;
}

export function AddSensorModal({ isOpen, onClose, onAddSensor }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<SensorType>('temperature');
  const [transport, setTransport] = useState<TransportType>('gpio');
  const [gpioPin, setGpioPin] = useState<number>(4);
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.150');
  const [ipPort, setIpPort] = useState<number>(80);
  const [endpoint, setEndpoint] = useState<string>('/api/sensor');
  const [roomId, setRoomId] = useState<string>('room-living-room');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const sensorPayload: any = {
      name,
      type,
      transport,
      roomId,
      enabled: true,
    };

    if (transport === 'gpio') {
      sensorPayload.gpioConfig = { pin: Number(gpioPin) };
    } else {
      sensorPayload.ipConfig = {
        ipAddress,
        port: Number(ipPort),
        endpoint,
      };
    }

    onAddSensor(sensorPayload);
    onClose();
  };

  return (
    <div className=" fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm\>
 <div className=\glass-card w-full max-w-lg p-6 border border-slate-700/80 shadow-2xl relative\>
 <div className=\flex items-center justify-between pb-4 mb-4 border-b border-slate-800\>
 <h3 className=\text-lg font-semibold text-slate-100 flex items-center gap-2\>
 <Plus className=\w-5 h-5 text-cyan-400\ /> Add New Sensor Endpoint
 </h3>
 <button onClick={onClose} className=\text-slate-400 hover:text-slate-200 transition-colors\>
 <X className=\w-5 h-5\ />
 </button>
 </div>

 <form onSubmit={handleSubmit} className=\space-y-4 text-sm\>
 <div>
 <label className=\block text-xs font-medium text-slate-400 mb-1\>Sensor Name</label>
 <input
 type=\text\
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder=\e.g. Master Bedroom Temp Sensor\
 className=\w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500\
 required
 />
 </div>

 <div className=\grid grid-cols-2 gap-3\>
 <div>
 <label className=\block text-xs font-medium text-slate-400 mb-1\>Sensor Type</label>
 <select
 value={type}
 onChange={(e) => setType(e.target.value as SensorType)}
 className=\w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500\
 >
 <option value=\temperature\>Temperature</option>
 <option value=\humidity\>Humidity</option>
 <option value=\relay\>Relay / Switch</option>
 <option value=\camera\>Camera Stream</option>
 <option value=\presence\>Presence Sensor</option>
 </select>
 </div>

 <div>
 <label className=\block text-xs font-medium text-slate-400 mb-1\>Room Assignment</label>
 <input
 type=\text\
 value={roomId}
 onChange={(e) => setRoomId(e.target.value)}
 placeholder=\e.g. room-living-room\
 className=\w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500\
 />
 </div>
 </div>

 <div>
 <label className=\block text-xs font-medium text-slate-400 mb-2\>Addressing Mode</label>
 <div className=\grid grid-cols-2 gap-3\>
 <button
 type=\button\
 onClick={() => setTransport('gpio')}
 className={py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all }
 >
 <CircuitBoard className=\w-4 h-4\ /> Local GPIO Pin
 </button>
 <button
 type=\button\
 onClick={() => setTransport('ip')}
 className={py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all }
 >
 <Globe className=\w-4 h-4\ /> Network IP Address
 </button>
 </div>
 </div>

 {transport === 'gpio' ? (
 <div className=\bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/40\>
 <label className=\block text-xs font-medium text-emerald-300 mb-1\>BCM GPIO Pin Number</label>
 <input
 type=\number\
 value={gpioPin}
 onChange={(e) => setGpioPin(Number(e.target.value))}
 placeholder=\4\
 className=\w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono\
 required
 />
 </div>
 ) : (
 <div className=\bg-blue-950/20 p-3 rounded-lg border border-blue-900/40 space-y-3\>
 <div>
 <label className=\block text-xs font-medium text-blue-300 mb-1\>IP Address</label>
 <input
 type=\text\
 value={ipAddress}
 onChange={(e) => setIpAddress(e.target.value)}
 placeholder=\192.168.1.150\
 className=\w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 font-mono\
 required
 />
 </div>

 <div className=\grid grid-cols-2 gap-3\>
 <div>
 <label className=\block text-xs font-medium text-blue-300 mb-1\>Port</label>
 <input
 type=\number\
 value={ipPort}
 onChange={(e) => setIpPort(Number(e.target.value))}
 className=\w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono\
 />
 </div>
 <div>
 <label className=\block text-xs font-medium text-blue-300 mb-1\>Endpoint</label>
 <input
 type=\text\
 value={endpoint}
 onChange={(e) => setEndpoint(e.target.value)}
 placeholder=\/api/sensor\
 className=\w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono\
 />
 </div>
 </div>
 </div>
 )}

 <div className=\flex justify-end gap-3 pt-3 border-t border-slate-800\>
 <button
 type=\button\
 onClick={onClose}
 className=\px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors\
 >
 Cancel
 </button>
 <button
 type=\submit\
 className=\px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors shadow-lg shadow-cyan-600/30\
 >
 Add Sensor
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}
