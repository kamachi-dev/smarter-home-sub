'use client';

import React from 'react';
import { SubControllerDevice } from '../lib/types/sensor';
import { Cpu, Wifi, Radio, ShieldCheck } from 'lucide-react';

interface Props {
  device: SubControllerDevice;
}

export function SubControllerCard({ device }: Props) {
  const isMdns = device.transport === 'mdns';

  return (
    <div className=" glass-card p-5 transition-all hover:border-cyan-500/40\>
 <div className=\flex items-start justify-between mb-3\>
 <div className=\flex items-center gap-3\>
 <div className=\p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20\>
 <Cpu className=\w-5 h-5\ />
 </div>
 <div>
 <h3 className=\font-semibold text-slate-100 text-base\>{device.name}</h3>
 <p className=\text-xs text-slate-400 font-mono\>ID: {device.deviceId}</p>
 </div>
 </div>
 <span className={px-2.5 py-1 text-xs rounded-full font-medium }>
 {isMdns ? 'mDNS ZeroConf' : 'Supabase Presence'}
 </span>
 </div>

 <div className=\grid grid-cols-2 gap-2 my-4 text-xs font-mono text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800\>
 <div>
 <span className=\text-slate-500 block\>IP Address</span>
 <span className=\text-cyan-300 font-semibold\>{device.ipAddress}:{device.port}</span>
 </div>
 <div>
 <span className=\text-slate-500 block\>MAC Address</span>
 <span>{device.macAddress || 'N/A'}</span>
 </div>
 <div>
 <span className=\text-slate-500 block\>Sensors</span>
 <span className=\text-emerald-400 font-semibold\>{device.sensorsCount} active</span>
 </div>
 <div>
 <span className=\text-slate-500 block\>Last Heartbeat</span>
 <span>{new Date(device.lastSeen).toLocaleTimeString()}</span>
 </div>
 </div>

 {device.capabilities && device.capabilities.length > 0 && (
 <div className=\flex flex-wrap gap-1.5 mt-2\>
 {device.capabilities.map((cap) => (
 <span key={cap} className=\text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700\>
 {cap}
 </span>
 ))}
 </div>
 )}
 </div>
 );
}
