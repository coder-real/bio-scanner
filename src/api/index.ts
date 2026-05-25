import axios from 'axios';
import { classifyForMedical, detectColorName, SAMPLE_READINGS } from '../utils/colorClassifier';
import type { MedicalInterpretation } from '../utils/colorClassifier';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export type { MedicalInterpretation };

export interface Patient {
  id: string;
  name: string;
  ward: string;
  age: number;
  dob: string;
  status: 'STABLE' | 'WARNING' | 'CRITICAL';
  heartRate: number;
  bloodPressure: string;
  lastUpdate: string;
}

export interface Reading {
  id: string;
  patientId: string;
  timestamp: string;
  r: number;
  g: number;
  b: number;
  colorName: string;
  colorHex: string;
  confidenceScore: number;
  testMode: string;
  interpretations: MedicalInterpretation[];
}

export interface GlucosePoint {
  time: string;
  value: number;
}

// ─── Mock Patients ────────────────────────────────────────────────────────────
const MOCK_PATIENTS: Patient[] = [
  { id: '4421-A', name: 'John Doe',       ward: 'Cardiology', age: 42, dob: '1982-03-15', status: 'STABLE',   heartRate: 72,  bloodPressure: '118/76', lastUpdate: '2 min ago' },
  { id: '3812-B', name: 'Sarah Mitchell', ward: 'General',    age: 35, dob: '1989-07-22', status: 'WARNING',  heartRate: 88,  bloodPressure: '135/88', lastUpdate: '5 min ago' },
  { id: '5590-C', name: 'Robert Chen',    ward: 'ICU',        age: 61, dob: '1963-01-09', status: 'CRITICAL', heartRate: 102, bloodPressure: '155/95', lastUpdate: '1 min ago' },
  { id: '2234-D', name: 'Amara Osei',     ward: 'Oncology',   age: 28, dob: '1996-05-30', status: 'STABLE',   heartRate: 68,  bloodPressure: '112/72', lastUpdate: '8 min ago' },
];

// ─── Generate Reading ─────────────────────────────────────────────────────────
function generateReading(patientId: string, forceSample?: number): Reading {
  const idx = forceSample !== undefined ? forceSample : Math.floor(Math.random() * SAMPLE_READINGS.length);
  const sample = SAMPLE_READINGS[idx % SAMPLE_READINGS.length];
  const { r, g, b } = sample;
  const { name: colorName, hex: colorHex } = detectColorName(r, g, b);
  const interpretations = classifyForMedical(r, g, b);

  return {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    patientId,
    timestamp: new Date().toISOString(),
    r, g, b,
    colorName,
    colorHex,
    confidenceScore: parseFloat((Math.random() * 4 + 95).toFixed(1)),
    testMode: sample.label,
    interpretations,
  };
}

function buildGlucoseTrend(): GlucosePoint[] {
  const labels = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', 'Now'];
  let val = 95 + Math.random() * 10;
  return labels.map((time) => {
    val = Math.max(75, Math.min(145, val + (Math.random() - 0.48) * 14));
    return { time, value: Math.round(val) };
  });
}

// ─── API Functions ────────────────────────────────────────────────────────────
export async function getPatients(): Promise<Patient[]> {
  if (!BASE_URL) return [...MOCK_PATIENTS];
  return (await axios.get(`${BASE_URL}/patients`)).data;
}

export async function getPatient(id: string): Promise<Patient> {
  if (!BASE_URL) {
    const p = MOCK_PATIENTS.find((p) => p.id === id);
    if (!p) throw new Error('Not found');
    return { ...p };
  }
  return (await axios.get(`${BASE_URL}/patients/${id}`)).data;
}

export async function addPatient(data: Omit<Patient, 'id' | 'lastUpdate' | 'status' | 'heartRate' | 'bloodPressure'>): Promise<Patient> {
  if (!BASE_URL) {
    const p: Patient = {
      ...data,
      id: `${Math.floor(Math.random() * 9000 + 1000)}-${String.fromCharCode(65 + MOCK_PATIENTS.length)}`,
      status: 'STABLE',
      heartRate: Math.floor(Math.random() * 30 + 60),
      bloodPressure: '120/80',
      lastUpdate: 'Just now',
    };
    MOCK_PATIENTS.push(p);
    return p;
  }
  return (await axios.post(`${BASE_URL}/patients`, data)).data;
}

export async function getReadings(): Promise<Reading> {
  if (!BASE_URL) return generateReading('4421-A');
  return (await axios.get(`${BASE_URL}/readings/latest`)).data;
}

export async function getPatientReadings(id: string): Promise<Reading[]> {
  if (!BASE_URL) {
    return Array.from({ length: 12 }, (_, i) => ({
      ...generateReading(id, i),
      id: `r-hist-${i}`,
      timestamp: new Date(Date.now() - i * 3_600_000).toISOString(),
    }));
  }
  return (await axios.get(`${BASE_URL}/patients/${id}/readings`)).data;
}

export async function addReading(data: Omit<Reading, 'id' | 'timestamp' | 'colorName' | 'colorHex' | 'interpretations'>): Promise<Reading> {
  const colorName = detectColorName(data.r, data.g, data.b).name;
  const colorHex  = detectColorName(data.r, data.g, data.b).hex;
  const interpretations = classifyForMedical(data.r, data.g, data.b);
  if (!BASE_URL) return { ...data, id: `r-${Date.now()}`, timestamp: new Date().toISOString(), colorName, colorHex, interpretations };
  return (await axios.post(`${BASE_URL}/readings`, data)).data;
}

export async function getGlucoseTrend(_patientId: string): Promise<GlucosePoint[]> {
  if (!BASE_URL) return buildGlucoseTrend();
  return (await axios.get(`${BASE_URL}/patients/${_patientId}/glucose-trend`)).data;
}
