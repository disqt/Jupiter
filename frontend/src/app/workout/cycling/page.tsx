'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RIDE_TYPES } from '@/lib/data';

function CyclingWorkoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date') || '';

  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [elevation, setElevation] = useState('');
  const [rideType, setRideType] = useState(RIDE_TYPES[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Dummy save — just navigate back
    setTimeout(() => {
      router.push('/');
    }, 300);
  };

  const dateDisplay = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div style={{ padding: '0 20px 140px' }}>
      <div className="screen-header">
        <button className="back-btn" onClick={() => router.push('/')}>
          &#8249;
        </button>
        <span style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: '22px', fontWeight: 400 }}>
          Séance vélo
        </span>
      </div>

      <div className="screen-date" style={{ textTransform: 'capitalize' }}>
        {dateDisplay}
      </div>

      <div className="field">
        <label>Type de sortie</label>
        <select value={rideType} onChange={(e) => setRideType(e.target.value)}>
          {RIDE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Durée (min)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="75"
        />
      </div>

      <div className="field">
        <label>Distance (km)</label>
        <input
          type="number"
          step="0.1"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="42.5"
        />
      </div>

      <div className="field">
        <label>Dénivelé (m)</label>
        <input
          type="number"
          value={elevation}
          onChange={(e) => setElevation(e.target.value)}
          placeholder="680"
        />
      </div>

      <button
        className="save-btn cycling-save"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );
}

export default function CyclingWorkout() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', color: 'var(--text-muted)' }}>Chargement...</div>}>
      <CyclingWorkoutForm />
    </Suspense>
  );
}
