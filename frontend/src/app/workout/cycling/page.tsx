'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RIDE_TYPES } from '@/lib/data';
import SaveAnimation from '@/components/SaveAnimation';

function CyclingWorkoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date') || '';

  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [elevation, setElevation] = useState('');
  const [rideType, setRideType] = useState(RIDE_TYPES[0]);
  const [saving, setSaving] = useState(false);

  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setShowSaveAnimation(true);
  };

  const dateDisplay = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return (
    <div className="px-5 pb-36 lg:max-w-xl lg:mx-auto lg:pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 pt-14 pb-5 lg:pt-8">
        <button onClick={() => router.push('/')}
          className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer text-base transition-all duration-150 active:scale-90 shrink-0">
          &#8249;
        </button>
        <span className="font-serif text-[22px] font-normal">Séance vélo</span>
      </div>

      <div className="text-[13px] text-text-muted mb-6 pl-12 capitalize">{dateDisplay}</div>

      {/* Fields — 2 columns on tablet+ */}
      <div className="md:grid md:grid-cols-2 md:gap-4">
        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Type de sortie</label>
          <select value={rideType} onChange={(e) => setRideType(e.target.value)}
            className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent appearance-none">
            {RIDE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Durée (min)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="75"
            className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted" />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Distance (km)</label>
          <input type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="42.5"
            className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted" />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Dénivelé (m)</label>
          <input type="number" value={elevation} onChange={(e) => setElevation(e.target.value)} placeholder="680"
            className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted" />
        </div>
      </div>

      {showSaveAnimation && <SaveAnimation onComplete={() => router.push('/?saved=1')} />}

      <button onClick={handleSave} disabled={saving}
        className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-cycling text-white shadow-[0_4px_20px_rgba(59,158,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide">
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );
}

export default function CyclingWorkout() {
  return (
    <Suspense fallback={<div className="p-5 text-text-muted">Chargement...</div>}>
      <CyclingWorkoutForm />
    </Suspense>
  );
}
