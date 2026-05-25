import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { getPatient, getPatientReadings } from '../api';
import type { Patient, Reading } from '../api';

const sevNum = (s: string) => (s === 'NORMAL' ? 1 : s === 'WARNING' ? 2 : 3);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const sevLabel = ['', 'Normal', 'Warning', 'Critical'];
  return (
    <div style={{ background: '#161616', border: '1px solid #393939', padding: '8px 12px', fontSize: 11, color: '#f4f4f4', fontFamily: 'var(--font-mono)' }}>
      <div style={{ color: '#8d8d8d', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i}>{p.name === 'severity' ? sevLabel[p.value] : `${p.value}%`}</div>
      ))}
    </div>
  );
};

export const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getPatient(id), getPatientReadings(id)]).then(([p, r]) => {
      setPatient(p); setReadings(r); setLoading(false);
    });
  }, [id]);

  const chartData = [...readings].reverse().map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    severity: Math.max(...r.interpretations.map(i => sevNum(i.status))),
    confidence: r.confidenceScore,
    color: r.colorHex,
    colorName: r.colorName,
  }));

  if (loading) return <Skel />;
  if (!patient) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
      Patient not found.{' '}
      <button onClick={() => navigate('/patients')} style={{ color: 'var(--color-interactive)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
        Back
      </button>
    </div>
  );

  const statusVariant = patient.status === 'STABLE' ? 'success' : patient.status === 'WARNING' ? 'warning' : 'danger';

  return (
    <div className="appear">
      {/* Back */}
      <button onClick={() => navigate('/patients')} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        border: 'none', background: 'none', cursor: 'pointer',
        color: 'var(--color-interactive)', fontSize: 13, marginBottom: 16,
        fontFamily: 'var(--font-body)', padding: 0,
      }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Patient Records
      </button>

      {/* Patient header */}
      <Card padding="0" style={{ marginBottom: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{ padding: '20px 24px', borderRight: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
            <div style={{ width: 52, height: 52, background: '#0f62fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 18, flexShrink: 0 }}>
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>{patient.name}</h1>
                <Badge variant={statusVariant} dot>{patient.status}</Badge>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                ID #{patient.id} · Ward: {patient.ward} · Age: {patient.age}
              </div>
            </div>
          </div>
          {/* Vitals strip */}
          {[['HEART RATE', `${patient.heartRate}`, 'bpm'], ['BLOOD PRESSURE', patient.bloodPressure, 'mmHg'], ['LAST UPDATE', patient.lastUpdate, '']].map(([lbl, val, unit]) => (
            <div key={lbl} style={{ padding: '20px 32px', borderRight: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--color-text-secondary)', marginBottom: 6 }}>{lbl}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 300 }}>{val}</div>
              {unit && <div style={{ fontSize: 9, color: 'var(--color-text-secondary)', marginTop: 2 }}>{unit}</div>}
            </div>
          ))}
          <div style={{ padding: '20px 24px', display: 'flex', gap: 8 }}>
            <Button variant="primary" size="sm" onClick={() => navigate('/live-scan')}>New Scan</Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/reports')}>Report</Button>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 1 }}>
        {/* Severity trend */}
        <Card padding="0">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Severity Trend
          </div>
          <div style={{ padding: '16px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={chartData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#8d8d8d', fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 9, fill: '#8d8d8d', fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} domain={[0, 3]} ticks={[1, 2, 3]}
                  tickFormatter={v => ['', 'Normal', 'Warn', 'Crit'][v] || ''} />
                <ReferenceLine y={2} stroke="#b28600" strokeDasharray="3 3" strokeWidth={1} />
                <ReferenceLine y={3} stroke="#da1e28" strokeDasharray="3 3" strokeWidth={1} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="severity" stroke="#0f62fe" strokeWidth={1.5} dot={{ r: 3, fill: '#0f62fe', strokeWidth: 0 }} activeDot={{ r: 4 }} name="severity" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Confidence trend */}
        <Card padding="0">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Scan Confidence (%)
          </div>
          <div style={{ padding: '16px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={chartData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#8d8d8d', fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 9, fill: '#8d8d8d', fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} domain={[90, 100]} />
                <ReferenceLine y={97} stroke="#198038" strokeDasharray="3 3" strokeWidth={1} label={{ value: '97%', position: 'insideTopRight', fontSize: 9, fill: '#198038' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="confidence" stroke="#198038" strokeWidth={1.5} dot={{ r: 3, fill: '#198038', strokeWidth: 0 }} activeDot={{ r: 4 }} name="confidence" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* History table */}
      <Card padding="0">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
          Reading History — {readings.length} records
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: 'var(--color-background)' }}>
                {['Time', 'Colour Detected', 'Medical Application', 'Interpretation', 'Confidence', 'Status'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 16px',
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-secondary)', textTransform: 'uppercase',
                    borderBottom: '1px solid var(--color-border-subtle)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {readings.map(r => {
                const topInterp = r.interpretations.reduce((w, i) => sevNum(i.status) > sevNum(w.status) ? i : w, r.interpretations[0] ?? { application: '—', interpretation: '—', status: 'NORMAL', detectedColor: '—', colorHex: '#ccc' });
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                      {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 14, height: 14, background: r.colorHex, border: '1px solid var(--color-border-subtle)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{r.colorName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12 }}>{topInterp.application}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--color-text-secondary)', maxWidth: 220 }}>{topInterp.interpretation}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{r.confidenceScore}%</td>
                    <td style={{ padding: '12px 16px' }}><SeverityBadge status={topInterp.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const Skel: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <div style={{ height: 100, background: '#e8e8e8' }} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
      <div style={{ height: 220, background: '#e0e0e0' }} />
      <div style={{ height: 220, background: '#e8e8e8' }} />
    </div>
    <div style={{ height: 320, background: '#e0e0e0' }} />
  </div>
);
