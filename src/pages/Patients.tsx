import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getPatients, addPatient } from '../api';
import type { Patient } from '../api';

export const Patients: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', ward: '', age: '', dob: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getPatients().then(d => { setPatients(d); setLoading(false); });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.ward.trim()) e.ward = 'Required';
    if (!form.age || isNaN(Number(form.age))) e.age = 'Valid number required';
    if (!form.dob) e.dob = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const p = await addPatient({ name: form.name, ward: form.ward, age: Number(form.age), dob: form.dob });
    setPatients(prev => [...prev, p]);
    setShowModal(false);
    setForm({ name: '', ward: '', age: '', dob: '' });
    setSaving(false);
  };

  const statusVariant = (s: Patient['status']) => s === 'STABLE' ? 'success' : s === 'WARNING' ? 'warning' : 'danger';

  return (
    <div className="appear">
      {/* Header */}
      <div style={{
        background: 'var(--color-layer-01)', borderBottom: '1px solid var(--color-border-subtle)',
        padding: '12px 0', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Patient Records</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {patients.length} patient{patients.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={<PlusIcon />}>Add Patient</Button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 1 }}>
          {[0, 1, 2, 3].map(i => <div key={i} style={{ height: 200, background: '#e0e0e0' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 1 }}>
          {patients.map(p => (
            <Card key={p.id} interactive onClick={() => navigate(`/patient/${p.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, background: '#0f62fe', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 600, fontSize: 13,
                }}>
                  {p.name.split(' ').map(n => n[0]).join('')}
                </div>
                <Badge variant={statusVariant(p.status)} dot>{p.status}</Badge>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>
                ID #{p.id}
              </div>
              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[['Ward', p.ward], ['Age', String(p.age)], ['Heart Rate', `${p.heartRate} bpm`], ['Blood Pressure', p.bloodPressure]].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{lbl}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                Updated: {p.lastUpdate}
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && patients.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>⊘</div>
          <p style={{ fontSize: 14 }}>No patients registered. Add your first patient record.</p>
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }} style={{
          position: 'fixed', inset: 0, background: 'rgba(22,22,22,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div className="appear" style={{
            background: 'var(--color-layer-01)', width: 440, boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', borderBottom: '1px solid var(--color-border-subtle)',
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Add New Patient</h2>
              <button onClick={() => setShowModal(false)} style={{
                border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px',
                fontSize: 20, color: 'var(--color-text-secondary)', lineHeight: 1,
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. John Doe' },
                  { key: 'ward', label: 'Ward', type: 'text', placeholder: 'e.g. Cardiology' },
                  { key: 'age', label: 'Age (years)', type: 'number', placeholder: '42' },
                  { key: 'dob', label: 'Date of Birth', type: 'date', placeholder: '' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, letterSpacing: '0.02em' }}>
                      {f.label}
                    </label>
                    <input
                      type={f.type} placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{
                        width: '100%', height: 40, padding: '0 12px',
                        border: `1px solid ${errors[f.key] ? '#da1e28' : 'var(--color-border-subtle)'}`,
                        borderBottom: `2px solid ${errors[f.key] ? '#da1e28' : 'var(--color-border-strong)'}`,
                        fontSize: 14, fontFamily: 'var(--font-body)',
                        color: 'var(--color-text-primary)', background: '#fff',
                        outline: 'none', borderRadius: 0, boxSizing: 'border-box',
                      }}
                      onFocus={e => { e.target.style.borderBottomColor = 'var(--color-interactive)'; }}
                      onBlur={e => { e.target.style.borderBottomColor = errors[f.key] ? '#da1e28' : 'var(--color-border-strong)'; }}
                    />
                    {errors[f.key] && <div style={{ fontSize: 11, color: '#da1e28', marginTop: 4 }}>{errors[f.key]}</div>}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 1, marginTop: 24 }}>
                <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" fullWidth loading={saving}>Add Patient</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PlusIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M5 12h14"/></svg>
);
