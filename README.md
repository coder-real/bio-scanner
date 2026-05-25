# JOSTUM BioScan Pro

A minimalist, professional medical IoT dashboard for real-time spectroscopic analysis. Built for JOSTUM, this system facilitates live color-based diagnostics using an ESP-01S and TCS3200 sensor.

![JOSTUM Branding](public/JOSTUM%20logo.png)

## 🚀 Key Features

- **Real-Time Data Pipeline**: Instant data push from hardware to dashboard via Server-Sent Events (SSE).
- **Medical Interpretation Engine**: Automatically maps RGB sensor data to 5 specific medical domains:
  - 🩸 **Blood Analysis**: Oxygen levels.
  - 🧪 **Urine Test**: Infection and blood detection.
  - 🧴 **Skin Disease**: Lesion and anemia detection.
  - 🩹 **Wound Monitoring**: Tissue healing and necrosis.
  - 📈 **PH Diagnostics**: Alkaline/Neutral/Acidic conditions.
- **Robust Device Tracking**: Features a 10s heartbeat mechanism to ensure accurate "Online/Offline" status.
- **IBM Carbon Inspired Design**: Clean, high-density, professional UI for clinical environments.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4.
- **Backend**: Node.js, Express.js (SSE for live updates).
- **Hardware**: ESP-01S (WiFi), TCS3200 Color Sensor, Arduino Uno.

## 📦 Getting Started

### 1. Requirements
- Node.js v18+
- Arduino IDE (for hardware deployment)

### 2. Backend Setup
```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Start the server
node server.js
```
The server will run on `http://localhost:3000`.

### 3. Frontend Setup
```bash
# In the root directory
npm install

# Start the development server
npm run dev
```
Access the dashboard at `http://localhost:5173`.

### 4. Hardware Setup
- Open `esp_heartbeat_sketch.ino` in Arduino IDE.
- Update `ssid`, `password`, and `SERVER_IP` with your network details.
- Flash to your ESP-01S.

## 📐 Architecture

1. **Hardware**: Reads color data -> Sends JSON POST to Node.js server.
2. **Server**: Receives data -> Updates device status -> Pushes to clients via SSE.
3. **Frontend**: Receives SSE stream -> Classifies color for medical domain -> Updates UI.

## 🛡️ License
Proprietary for JOSTUM Medical Systems.
