# Smarter Home Sub-Controller

Dedicated **Next.js Sub-Controller Service** designed to manage dual GPIO and network IP-address sensors, auto-discover sub-controller nodes, and stream sensor telemetry directly into Supabase via **Supabase Realtime**.

Companion to [smarter-home](https://github.com/kamachi-dev/smarter-home) and [smarter-home-pi](https://github.com/kamachi-dev/smarter-home-pi).

## Features

- **Dual Sensor Addressing**: Configure local hardware pins (GPIO 4, GPIO 17) as well as network IP endpoints (http://192.168.1.x/api/sensor, ESP32 REST nodes, Tapo cameras).
- **Sub-Controller Auto-Discovery**: Clean sub-controller node differentiation using **mDNS ZeroConf (onjour-service)** and **Supabase Realtime Presence**.
- **Realtime Telemetry Daemon**: Live broadcast streaming over smarter-home:telemetry and Postgres table persistence.
- **Glassmorphic Management UI**: Built with Next.js 15, Tailwind CSS, and Lucide Icons.

## Getting Started

`ash
npm install
npm run dev
`

Run tests:
`ash
npm test
`
