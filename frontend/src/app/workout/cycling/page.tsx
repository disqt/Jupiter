'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RIDE_TYPES } from '@/lib/data';
import { createWorkout, fetchWorkout, deleteWorkout } from '@/lib/api';
import SaveAnimation from '@/components/SaveAnimation';

function CyclingWorkoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date') || '';
  const workoutId = searchParams.get('id');

  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [elevation, setElevation] = useState('');
  const [rideType, setRideType] = useState(RIDE_TYPES[0]);
  const [saving, setSaving] = useState(false);
  const [loadingWorkout, setLoadingWorkout] = useState(!!workoutId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

  // Load existing workout from API
  useEffect(() => {
    if (!workoutId) return;
    setLoadingWorkout(true);
    fetchWorkout(parseInt(workoutId)).then((data) => {
      if (data.cycling_details) {
        const cd = data.cycling_details as Record<string, unknown>;
        if (cd.duration) setDuration(String(cd.duration));
        if (cd.distance) setDistance(String(cd.distance));
        if (cd.elevation) setElevation(String(cd.elevation));
        if (cd.ride_type) setRideType(String(cd.ride_type));
      }
    }).catch(console.error).finally(() => setLoadingWorkout(false));
  }, [workoutId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createWorkout({
        date,
        type: 'velo',
        cycling_details: {
          duration: duration ? parseInt(duration) : undefined,
          distance: distance ? parseFloat(distance) : undefined,
          elevation: elevation ? parseInt(elevation) : undefined,
          ride_type: rideType,
        },
      });
      setShowSaveAnimation(true);
    } catch (err) {
      console.error('Save failed:', err);
      setSaving(false);
    }
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

      {loadingWorkout && (
        <div className="text-text-muted text-[13px] text-center py-8">Chargement de la séance...</div>
      )}

      {showSaveAnimation && <SaveAnimation onComplete={() => router.push('/?saved=1')} />}

      {!workoutId && (
        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] bg-cycling text-white shadow-[0_4px_20px_rgba(59,158,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide">
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      )}

      {/* Delete workout */}
      {workoutId && (
        <button onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-3.5 bg-transparent border border-border rounded-card text-red-400 text-[14px] font-medium font-inherit cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] active:bg-red-500/10">
          Supprimer la séance
        </button>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <>
          <div onClick={() => setShowDeleteConfirm(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
          <div className="fixed inset-0 z-[51] flex items-center justify-center px-8" onClick={() => setShowDeleteConfirm(false)}>
            <div onClick={(e) => e.stopPropagation()}
              className="bg-bg-card border border-border rounded-card p-5 w-full max-w-[320px] animate-fadeIn">
              <h3 className="text-[15px] font-semibold mb-2">Supprimer cette séance ?</h3>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
                Cette action est irréversible. Toutes les données de cette sortie seront supprimées.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-bg-elevated border border-border rounded-sm text-text text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
                  Annuler
                </button>
                <button onClick={async () => {
                  setDeleting(true);
                  try {
                    await deleteWorkout(parseInt(workoutId!));
                    router.push('/');
                  } catch (err) {
                    console.error('Delete failed:', err);
                    setDeleting(false);
                    setShowDeleteConfirm(false);
                  }
                }} disabled={deleting}
                  className="flex-1 py-2.5 bg-red-500/15 border border-red-500/30 rounded-sm text-red-400 text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98] disabled:opacity-50">
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
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
