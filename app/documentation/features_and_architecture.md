# Smarter Home Sub-Controller Architecture & System Features

## System Overview
smarter-home-sub is a Next.js service built to run on sub-controllers (Raspberry Pi nodes, ESP gateways, local home servers) with the purpose of reading sensor data, auto-discovering sub-controller nodes, and transmitting live telemetry into Supabase via **Supabase Realtime**.

## Core Features

### 1. Dual Sensor Addressing (GPIO & Network IP)
- **Local GPIO Support**: Direct mapping to BCM GPIO hardware pins (e.g. GPIO 4 DHT22, GPIO 17 relay switch) with virtual hardware fallback when running in dev/non-Pi environments.
- **Network IP Support**: Microcontrollers, HTTP REST sensors, RTSP camera streams, and smart devices (e.g. Tapo, ESP32) addressable via IP addresses (http://192.168.1.x/api/sensor).

### 2. Clean Sub-Controller Identification & Zero-Config Auto-Discovery
- **mDNS ZeroConf (onjour-service)**: Automatically discovers and advertises sub-controller services (_smarterhome-sub._tcp) on the local network without requiring manual IP typing.
- **Supabase Realtime Presence**: Remote or multi-subnet sub-controllers broadcast presence and heartbeats containing MAC address, node capabilities, uptime, and sensor count.

### 3. Realtime Supabase Telemetry Sync
- **Supabase Realtime Channel**: Broadcasts sensor_readings events over smarter-home:telemetry.
- **Database Persistence**: Automatic upserts into Postgres tables (sensor_telemetry and ooms).

## Route Paths & API Definitions
- / - Glassmorphic Next.js Dashboard UI for sub-controllers, dual sensors, and real-time logs.
- GET /api/sensors - List registered GPIO & IP sensors and current readings.
- POST /api/sensors - Dynamically register a new GPIO or IP sensor.
- DELETE /api/sensors?id={id} - Unregister a sensor.
- GET /api/devices - List auto-discovered sub-controller devices.
- POST /api/devices - Announce sub-controller device presence.
- GET /api/telemetry - Snapshot of all telemetry readings.
- POST /api/telemetry - Trigger live transmission to Supabase Realtime.
