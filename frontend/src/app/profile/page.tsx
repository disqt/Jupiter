'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import TextInput from '@/components/TextInput';
import BottomSheet from '@/components/BottomSheet';
import { getGuestWorkouts, clearGuestWorkouts } from '@/lib/guest-storage';
import { fetchExercises, createExercise, createWorkout } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function migrateGuestData() {
  // 1. Get guest exercises and workouts
  const guestExercisesRaw = localStorage.getItem('guest-exercises');
  const guestExercises: { id: number; name: string; muscle_group: string }[] =
    guestExercisesRaw ? JSON.parse(guestExercisesRaw) : [];

  // 2. Fetch DB exercises (seeded on registration, or existing for login)
  const dbExercises = await fetchExercises();

  // 3. Build ID mapping: guest exercise ID → DB exercise ID
  const idMap = new Map<number, number>();

  for (const ge of guestExercises) {
    // Try to find matching DB exercise by name + muscle_group
    const match = dbExercises.find(
      (de) => de.name === ge.name && de.muscle_group === ge.muscle_group
    );
    if (match) {
      idMap.set(ge.id, match.id);
    } else {
      // Custom exercise — create in DB
      const created = await createExercise(ge.name, ge.muscle_group);
      idMap.set(ge.id, created.id);
    }
  }

  // 4. Migrate workouts, remapping exercise IDs
  const guestWorkouts = getGuestWorkouts();
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

  // 5. Clear guest data
  clearGuestWorkouts();
  localStorage.removeItem('guest-exercises');
}

function RegisterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { register } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!nickname.trim() || !password.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      await register(nickname.trim(), password, email.trim());
      setMigrating(true);
      await migrateGuestData();
      router.push('/calendar');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error';
      setError(message);
      setMigrating(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} desktopSidebarOffset>
      <h2 className="text-[17px] font-semibold text-text mb-4">{t.createAccount}</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
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
          <label className="block text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
            {t.nickname}
          </label>
          <TextInput
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); if (error) setError(''); }}
            autoComplete="username"
            error={!!error}
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
            {t.password}
          </label>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
            autoComplete="new-password"
            error={!!error}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-[13px] text-center mt-3">{error}</p>
      )}

      {migrating && (
        <p className="text-text-muted text-[13px] text-center mt-3">{t.migrating}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || migrating}
        className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-5 transition-all duration-200 active:scale-[0.98] bg-accent text-white disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
      >
        {submitting ? '...' : t.createMyAccount}
      </button>

      <button
        onClick={onClose}
        className="w-full py-3 bg-transparent border-none font-inherit text-[14px] cursor-pointer mt-2 text-text-muted"
      >
        {t.cancel}
      </button>
    </BottomSheet>
  );
}

function LoginSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!nickname.trim() || !password.trim()) return;
    setSubmitting(true);
    try {
      await login(nickname.trim(), password);
      setMigrating(true);
      await migrateGuestData();
      router.push('/calendar');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error';
      setError(message);
      setMigrating(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} desktopSidebarOffset>
      <h2 className="text-[17px] font-semibold text-text mb-4">{t.loginButton}</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
            {t.nickname}
          </label>
          <TextInput
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); if (error) setError(''); }}
            autoComplete="username"
            error={!!error}
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
            {t.password}
          </label>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
            autoComplete="current-password"
            error={!!error}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-[13px] text-center mt-3">{error}</p>
      )}

      {migrating && (
        <p className="text-text-muted text-[13px] text-center mt-3">{t.migrating}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || migrating}
        className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-5 transition-all duration-200 active:scale-[0.98] bg-accent text-white disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
      >
        {submitting ? '...' : t.loginButton}
      </button>

      <button
        onClick={onClose}
        className="w-full py-3 bg-transparent border-none font-inherit text-[14px] cursor-pointer mt-2 text-text-muted"
      >
        {t.cancel}
      </button>
    </BottomSheet>
  );
}

/* ─── Section wrapper ─── */
function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-sm opacity-60">{icon}</span>
        <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em]">{title}</h3>
      </div>
      <div className="bg-bg-card border border-border rounded-card overflow-hidden">
        {children}
      </div>
    </div>
  );
}

/* ─── Row inside a section card ─── */
function SettingRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 ${last ? '' : 'border-b border-border'}`}>
      <span className="text-[14px] text-text">{label}</span>
      {children}
    </div>
  );
}

/* ─── Avatar ─── */
function Avatar({ name, size = 'lg' }: { name: string; size?: 'lg' | 'sm' }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
  const s = size === 'lg' ? 'w-[72px] h-[72px] text-[22px]' : 'w-10 h-10 text-sm';
  return (
    <div className={`${s} rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 flex items-center justify-center font-semibold text-accent shrink-0`}>
      {initials}
    </div>
  );
}

function GuestProfileView() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="page-container px-5 pb-36 lg:pb-20">
      {/* Header */}
      <div className="pt-14 pb-4 lg:pt-8">
        <h1 className="font-serif text-[22px] font-normal">{t.profile}</h1>
      </div>

      {/* Guest avatar + CTA hero */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-text-muted/20 to-text-muted/5 border border-border flex items-center justify-center text-[28px] mb-4">
          👤
        </div>
        <h2 className="text-[18px] font-semibold text-text mb-1.5">{t.guestMode}</h2>
        <p className="text-[13px] text-text-muted leading-relaxed max-w-[280px]">
          {t.guestBanner}
        </p>
      </div>

      {/* Account actions */}
      <div className="mb-8">
        <button
          onClick={() => setShowRegister(true)}
          className="w-full py-3.5 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98] bg-accent text-white tracking-wide"
        >
          {t.createAccount}
        </button>

        <p className="text-[13px] text-text-muted text-center mt-3">
          {t.alreadyHaveAccount}{' '}
          <button
            onClick={() => setShowLogin(true)}
            className="text-accent bg-transparent border-none font-inherit text-[13px] cursor-pointer underline p-0"
          >
            {t.loginToAccount}
          </button>
        </p>
      </div>

      {/* Settings */}
      <Section icon="⚙️" title={t.settings}>
        <SettingRow label={t.language} last>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'fr' | 'en')}
            className="bg-bg-elevated border border-border rounded-sm px-3 py-1.5 text-[13px] text-text font-medium cursor-pointer outline-none appearance-none font-inherit"
          >
            <option value="fr">{t.french}</option>
            <option value="en">{t.english}</option>
          </select>
        </SettingRow>
      </Section>

      <RegisterSheet open={showRegister} onClose={() => setShowRegister(false)} />
      <LoginSheet open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}

function AuthenticatedProfileView() {
  const { user, logout, updateUser } = useAuth();
  const { t, locale, setLocale } = useI18n();

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const body: Record<string, string> = {};

      if (nickname && nickname !== user?.nickname) {
        body.nickname = nickname;
      }

      if (currentPassword && newPassword) {
        body.current_password = currentPassword;
        body.password = newPassword;
      }

      if (Object.keys(body).length === 0) {
        setSaving(false);
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error');
      }

      if (body.nickname) {
        updateUser({ id: user!.id, nickname: body.nickname });
      }

      setCurrentPassword('');
      setNewPassword('');
      setSuccessMsg(t.profileUpdated);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error';
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container px-5 pb-36 lg:pb-20">
      {/* Header */}
      <div className="pt-14 pb-4 lg:pt-8">
        <h1 className="font-serif text-[22px] font-normal">{t.profile}</h1>
      </div>

      {/* User header card */}
      <div className="flex items-center gap-4 bg-bg-card border border-border rounded-card p-5 mb-8">
        <Avatar name={user?.nickname || '?'} />
        <div className="min-w-0">
          <h2 className="text-[18px] font-semibold text-text truncate">{user?.nickname}</h2>
          <p className="text-[13px] text-text-muted mt-0.5">{t.editProfile}</p>
        </div>
      </div>

      {/* Profile section */}
      <Section icon="👤" title={t.editProfile}>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              {t.nickname}
            </label>
            <TextInput
              value={nickname}
              onChange={(e) => { setNickname(e.target.value); if (errorMsg) setErrorMsg(''); }}
              error={!!errorMsg && !currentPassword}
            />
          </div>
        </div>
      </Section>

      {/* Security section */}
      <Section icon="🔒" title={t.security}>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              {t.currentPassword}
            </label>
            <TextInput
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); if (errorMsg) setErrorMsg(''); }}
              error={!!errorMsg && !!currentPassword}
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              {t.newPassword}
            </label>
            <TextInput
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); if (errorMsg) setErrorMsg(''); }}
              error={!!errorMsg && !!currentPassword}
            />
          </div>
        </div>
      </Section>

      {/* Success / Error messages */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-card px-4 py-3 mb-4">
          <span className="text-sm">&#10003;</span>
          <p className="text-green-400 text-[13px]">{successMsg}</p>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-card px-4 py-3 mb-4">
          <p className="text-red-400 text-[13px]">{errorMsg}</p>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98] bg-gradient-to-br from-accent to-[#7c5ce0] text-white shadow-[0_4px_20px_rgba(139,92,246,0.2)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide mb-8"
      >
        {saving ? t.saving : t.saveChanges}
      </button>

      {/* Divider */}
      <div className="h-px bg-border mb-8" />

      {/* App Settings */}
      <Section icon="⚙️" title={t.appSettings}>
        <SettingRow label={t.language} last>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'fr' | 'en')}
            className="bg-bg-elevated border border-border rounded-sm px-3 py-1.5 text-[13px] text-text font-medium cursor-pointer outline-none appearance-none font-inherit"
          >
            <option value="fr">{t.french}</option>
            <option value="en">{t.english}</option>
          </select>
        </SettingRow>
      </Section>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3.5 bg-transparent border border-red-500/20 rounded-card font-inherit text-[14px] font-medium cursor-pointer transition-all duration-200 active:scale-[0.98] text-red-400 hover:bg-red-500/5 tracking-wide"
      >
        {t.logout}
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { isGuest } = useAuth();

  if (isGuest) {
    return <GuestProfileView />;
  }

  return <AuthenticatedProfileView />;
}
