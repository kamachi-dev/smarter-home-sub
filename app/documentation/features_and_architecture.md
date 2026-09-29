# Smarter Home Sub-Controller Architecture & System Features

## System Overview
`smarter-home-sub` is a dedicated edge service built to run on distributed sub-controllers (secondary Raspberry Pi nodes, ESP gateways, local edge compute nodes) with the sole purpose of sending sensor data into `smarter-home` / `smarter-home-pi` and executing incoming actuation commands (lights and relays) dispatched from the ecosystem.

## Core Features

### 1. Dual Sensor Addressing (GPIO & Network IP)
- **Local GPIO Support**: Direct mapping to BCM GPIO hardware pins (e.g. GPIO 4 DHT22, GPIO 17 relay switch) with graceful virtual hardware fallback (`GpioAdapter`) when running in dev/non-Pi environments.
- **Network IP Support**: Microcontrollers, HTTP REST sensors, RTSP camera streams, and smart devices (e.g. Tapo, ESP32) addressable via IP addresses (`http://192.168.1.x/api/sensor`).

### 2. Clean Sub-Controller Identification & Zero-Config Auto-Discovery
- **mDNS ZeroConf (`bonjour-service`)**: Automatically discovers and advertises sub-controller services (`_smarterhome-sub._tcp`) on the local network without requiring manual IP typing.
- **Supabase Realtime Presence**: Remote or multi-subnet sub-controllers broadcast presence and heartbeats containing MAC address, node capabilities, uptime, and sensor count.

### 3. Realtime Supabase & MQTT Telemetry Sync
- **MQTT Telemetry Transmitter (`MqttTransmitterDaemon`)**: Streams sensor readings directly over MQTT to Mosquitto on the main Raspberry Pi (`smarterhome/{homeToken}/sub/{deviceId}/readings`), bypassing database write contention and feeding live temperature/humidity directly to the dashboard.
- **Hardware Command & Actuation Engine**: Subscribes to `smarterhome/{homeToken}/commands/{deviceId}` and Supabase Realtime broadcast/CDC changes for the `rooms` table. When light or AC relays assigned to this sub-controller are switched, executes physical/virtual relay GPIO toggling via `GpioAdapter.writeGpioPin()`.
- **Controller-Aware Sync (`SensorEngine.syncFromSupabase()`)**: Hydrates room sensor mappings and binds GPIO pins specifically designated for this sub-controller in `home_states` (`room_controllers`), preventing duplicate pin contention across multiple controllers.

## Route Paths & API Definitions
- `/` - Headless daemon status and API reference endpoint.
- `GET /api/sensors` - List registered GPIO & IP sensors and current readings.
- `POST /api/sensors` - Dynamically register a new GPIO or IP sensor.
- `DELETE /api/sensors?id={id}` - Unregister a sensor.
- `GET /api/pins/assign` - Retrieve room GPIO pin assignments.
- `POST /api/pins/assign` - Explicitly map a room sensor or relay to a local GPIO pin.
- `GET /api/devices` - List auto-discovered sub-controller devices.
- `POST /api/devices` - Announce sub-controller device presence.
- `GET /api/telemetry` - Snapshot of all telemetry readings and MQTT transmitter status.
- `POST /api/telemetry` - Trigger live telemetry transmission over MQTT.
