'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import TextInput from '@/components/TextInput';
import { getGuestWorkouts, clearGuestWorkouts } from '@/lib/guest-storage';
import { fetchExercises, createExercise, createWorkout, createTemplate } from '@/lib/api';

async function migrateGuestData() {
  // 1. Snapshot guest data and clear localStorage immediately to prevent
  //    duplicate migrations if the user logs in again before this finishes
  const guestExercisesRaw = localStorage.getItem('guest-exercises');
  const guestExercises: { id: number; name: string; muscle_group: string }[] =
    guestExercisesRaw ? JSON.parse(guestExercisesRaw) : [];
  const guestWorkouts = getGuestWorkouts();

  // Nothing to migrate
  if (guestExercises.length === 0 && guestWorkouts.length === 0) return;

  // Clear guest data NOW — before any async work
  clearGuestWorkouts();
  localStorage.removeItem('guest-exercises');

  // 2. Fetch DB exercises (seeded on registration, or existing for login)
  const dbExercises = await fetchExercises();

  // 3. Build ID mapping: guest exercise ID → DB exercise ID
  const idMap = new Map<number, number>();

  for (const ge of guestExercises) {
    const match = dbExercises.find(
      (de) => de.name === ge.name && de.muscle_group === ge.muscle_group
    );
    if (match) {
      idMap.set(ge.id, match.id);
    } else {
      const created = await createExercise(ge.name, ge.muscle_group);
      idMap.set(ge.id, created.id);
    }
  }

  // 4. Migrate workouts, remapping exercise IDs
  for (const gw of guestWorkouts) {
    const payload: Record<string, unknown> = {
      type: gw.type,
      date: gw.date,
      notes: gw.notes,
      custom_emoji: gw.custom_emoji,
      custom_name: gw.custom_name,
    };
    if (gw.cycling_details) payload.cycling_details = gw.cycling_details;
    if (gw.workout_details) payload.workout_details = gw.workout_details;
    if (gw.exercise_logs) {
      payload.exercise_logs = gw.exercise_logs.map(log => ({
        exercise_id: idMap.get(log.exercise_id) || log.exercise_id,
        set_number: log.set_number,
        reps: log.reps,
        weight: log.weight,
      }));
    }
    if (gw.exercise_notes) {
      payload.exercise_notes = gw.exercise_notes.map(note => ({
        exercise_id: idMap.get(note.exercise_id) || note.exercise_id,
        note: note.note,
        pinned: note.pinned,
      }));
    }
    await createWorkout(payload as Parameters<typeof createWorkout>[0]);
  }

  // 5. Migrate guest templates, remapping exercise IDs
  const guestTemplatesRaw = localStorage.getItem('guest-templates');
  localStorage.removeItem('guest-templates');
  const guestTemplates: { name: string; workout_type: string; exercises: { exercise_id: number; sort_order: number; mode: string; set_count: number }[] }[] =
    guestTemplatesRaw ? JSON.parse(guestTemplatesRaw) : [];

  for (const gt of guestTemplates) {
    try {
      await createTemplate({
        name: gt.name,
        workout_type: gt.workout_type,
        exercises: gt.exercises.map(e => ({
          exercise_id: idMap.get(e.exercise_id) || e.exercise_id,
          sort_order: e.sort_order,
          mode: e.mode,
          set_count: e.set_count,
        })),
      });
    } catch { /* ignore failed template migration */ }
  }
}

type Step = 'identity' | 'password';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState<Step>('identity');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const canContinue = email.trim() && nickname.trim();
  const canSubmit = password.length >= 6 && confirmPassword.length >= 6;

  const handleContinue = () => {
    setError('');
    if (!canContinue) return;
    setStep('password');
  };

  const handleSubmit = async () => {
    setError('');
    if (password.length < 6) {
      setError(t.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordsMismatch);
      return;
    }
    setSubmitting(true);
    try {
      await register(nickname.trim(), password, email.trim());
      setMigrating(true);
      await migrateGuestData();
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error';
      setError(message);
      setMigrating(false);
    } finally {
      setSubmitting(false);
    }
  };

  const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
      {visible ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );

  if (step === 'identity') {
    return (
      <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-[40px] mb-3">🏅</div>
            <h1 className="text-[24px] font-semibold text-text mb-1">Jupiter Tracker</h1>
            <p className="text-[14px] text-text-muted">{t.registerTagline}</p>
          </div>

          {/* Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
                {t.email}
              </label>
              <TextInput
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                placeholder={t.emailPlaceholder}
                type="email"
                autoComplete="email"
                error={!!error}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
                {t.nickname}
              </label>
              <TextInput
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); if (error) setError(''); }}
                autoComplete="username"
                error={!!error}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-[13px] text-center mb-4">{error}</p>
          )}

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full py-3.5 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98] bg-gradient-to-br from-[#c9a96e] to-[#a0833a] text-white tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.continueButton}
          </button>

          {/* Login link */}
          <p className="text-[13px] text-text-muted text-center mt-4">
            {t.alreadyHaveAccount}{' '}
            <button
              onClick={() => router.push('/profile')}
              className="text-accent bg-transparent border-none font-inherit text-[13px] cursor-pointer underline p-0"
            >
              {t.loginToAccount}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Password
  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col px-6 pt-14">
      <div className="w-full max-w-sm mx-auto">
        {/* Back button */}
        <button
          onClick={() => { setStep('identity'); setError(''); }}
          className="flex items-center gap-1 text-[14px] text-text-muted bg-transparent border-none font-inherit cursor-pointer p-0 mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          {t.back}
        </button>

        {/* Title */}
        <h1 className="text-[22px] font-semibold text-text mb-1">{t.choosePassword}</h1>
        <p className="text-[14px] text-text-muted mb-8">{t.minChars}</p>

        {/* Password form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 mb-6">
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
              {t.password}
            </label>
            <div className="relative">
              <TextInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                autoComplete="new-password"
                error={!!error}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1"
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-1.5">
              {t.confirmPassword}
            </label>
            <div className="relative">
              <TextInput
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                autoComplete="new-password"
                error={!!error}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1"
              >
                <EyeIcon visible={showConfirm} />
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-[13px] text-center">{error}</p>
          )}

          {migrating && (
            <p className="text-text-muted text-[13px] text-center">{t.migrating}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!canSubmit || submitting || migrating}
            className="w-full py-3.5 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98] bg-gradient-to-br from-[#c9a96e] to-[#a0833a] text-white tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? '...' : t.createMyAccount}
          </button>
        </form>
      </div>
    </div>
  );
}
