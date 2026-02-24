'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const RIDE_TYPES = ['Route', 'Gravel', 'Home trainer', 'VTT', 'Vélotaf'];

function CyclingWorkoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date') || '';

  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [elevation, setElevation] = useState('');
  const [rideType, setRideType] = useState(RIDE_TYPES[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.createWorkout({
        date,
        type: 'velo',
        cycling_details: {
          duration: duration ? parseInt(duration) : null,
          distance: distance ? parseFloat(distance) : null,
          elevation: elevation ? parseInt(elevation) : null,
          ride_type: rideType,
        },
      });
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/')} className="text-gray-500">&larr;</button>
        <h1 className="text-lg font-semibold">Séance vélo</h1>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        {date && new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de sortie</label>
          <select
            value={rideType}
            onChange={(e) => setRideType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
          >
            {RIDE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="60"
            className="w-full border border-gray-300 rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
          <input
            type="number"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="30"
            className="w-full border border-gray-300 rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dénivelé (m)</label>
          <input
            type="number"
            value={elevation}
            onChange={(e) => setElevation(e.target.value)}
            placeholder="500"
            className="w-full border border-gray-300 rounded-lg p-3"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-6 bg-blue-600 text-white font-medium py-3 rounded-lg disabled:opacity-50"
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );
}

export default function CyclingWorkout() {
  return (
    <Suspense fallback={<div className="p-4">Chargement...</div>}>
      <CyclingWorkoutForm />
    </Suspense>
  );
}
