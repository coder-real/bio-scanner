import { useState, useEffect } from 'react';

export interface LiveReading {
  id:        number;
  r:         number;
  g:         number;
  b:         number;
  result:    string;
  patientId: string;
  timestamp: string;
}

export interface DeviceStatus {
  id:       string;
  name:     string;
  type:     string;
  ward:     string;
  firmware: string;
  lastPing: string | null;
  status:   'online' | 'offline';
}

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export function useLiveReading() {
  const [latest,          setLatest]          = useState<LiveReading | null>(null);
  const [history,         setHistory]         = useState<LiveReading[]>([]);
  const [device,          setDevice]          = useState<DeviceStatus | null>(null);
  const [streamConnected, setStreamConnected] = useState(false);

  // Load history + device on mount
  useEffect(() => {
    fetch(`${SERVER}/api/readings`)
      .then(r => r.json())
      .then((data: LiveReading[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setHistory(data);
          setLatest(data[data.length - 1]);
        }
      })
      .catch(console.error);

    fetch(`${SERVER}/api/device`)
      .then(r => r.json())
      .then((data: DeviceStatus) => setDevice(data))
      .catch(console.error);
  }, []);

  // SSE push
  useEffect(() => {
    let es: EventSource;
    let retryTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      es = new EventSource(`${SERVER}/api/stream`);

      es.onopen = () => {
        setStreamConnected(true);
        console.log('[SSE] Connected');
      };

      es.onmessage = (e) => {
        const data = JSON.parse(e.data) as LiveReading & { deviceUpdate?: DeviceStatus; cleared?: boolean };

        if (data.deviceUpdate) {
          setDevice(data.deviceUpdate);
          return;
        }
        if (data.cleared) {
          setHistory([]);
          setLatest(null);
          return;
        }
        // New reading
        const reading = data as LiveReading;
        setLatest(reading);
        setHistory(prev => [...prev, reading].slice(-100));
      };

      es.onerror = () => {
        setStreamConnected(false);
        es.close();
        retryTimer = setTimeout(connect, 5000);
      };
    };

    connect();
    return () => { es?.close(); clearTimeout(retryTimer); };
  }, []);

  return { latest, history, device, streamConnected };
}
