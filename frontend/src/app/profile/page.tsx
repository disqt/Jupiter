'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import TextInput from '@/components/TextInput';
import BottomSheet from '@/components/BottomSheet';
import { getGuestWorkouts, clearGuestWorkouts } from '@/lib/guest-storage';
import { createWorkout } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function migrateGuestWorkouts() {
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
    if (gw.exercise_logs) payload.exercise_logs = gw.exercise_logs;
    if (gw.exercise_notes) payload.exercise_notes = gw.exercise_notes;
    await createWorkout(payload as Parameters<typeof createWorkout>[0]);
  }
  clearGuestWorkouts();
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
      await migrateGuestWorkouts();
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
      await migrateGuestWorkouts();
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

function GuestProfileView() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="page-container px-5 pb-36 lg:pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 pt-14 pb-5 lg:pt-8">
        <button
          onClick={() => router.push('/calendar')}
          className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer text-base transition-all duration-150 active:scale-90 shrink-0"
        >
          &#8249;
        </button>
        <span className="font-serif text-[22px] font-normal">{t.profile}</span>
      </div>

      {/* Guest mode card */}
      <div className="bg-bg-elevated border border-border rounded-card p-5">
        <h2 className="text-[17px] font-semibold text-text mb-2">{t.guestMode}</h2>
        <p className="text-[14px] text-text-muted leading-relaxed mb-5">
          {t.guestModeDescription}
        </p>

        <button
          onClick={() => setShowRegister(true)}
          className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98] bg-accent text-white tracking-wide"
        >
          {t.createAccount}
        </button>

        <p className="text-[13px] text-text-muted text-center mt-4">
          {t.alreadyHaveAccount}{' '}
          <button
            onClick={() => setShowLogin(true)}
            className="text-accent bg-transparent border-none font-inherit text-[13px] cursor-pointer underline p-0"
          >
            {t.loginToAccount}
          </button>
        </p>
      </div>

      {/* Language toggle */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
          className="px-4 py-2 bg-bg-elevated border border-border rounded-card font-inherit text-[14px] cursor-pointer text-text-muted transition-all duration-150 active:scale-95"
        >
          {locale === 'fr' ? 'EN' : 'FR'}
        </button>
      </div>

      <RegisterSheet open={showRegister} onClose={() => setShowRegister(false)} />
      <LoginSheet open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}

function AuthenticatedProfileView() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const { t } = useI18n();

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
      <div className="flex items-center gap-3 pt-14 pb-5 lg:pt-8">
        <button
          onClick={() => router.push('/calendar')}
          className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer text-base transition-all duration-150 active:scale-90 shrink-0"
        >
          &#8249;
        </button>
        <span className="font-serif text-[22px] font-normal">{t.profile}</span>
      </div>

      {/* Nickname section */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
          {t.nickname}
        </label>
        <TextInput
          value={nickname}
          onChange={(e) => { setNickname(e.target.value); if (errorMsg) setErrorMsg(''); }}
          error={!!errorMsg}
        />
      </div>

      {/* Change password section */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
          {t.currentPassword}
        </label>
        <TextInput
          type="password"
          value={currentPassword}
          onChange={(e) => { setCurrentPassword(e.target.value); if (errorMsg) setErrorMsg(''); }}
          error={!!errorMsg}
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
          {t.newPassword}
        </label>
        <TextInput
          type="password"
          value={newPassword}
          onChange={(e) => { setNewPassword(e.target.value); if (errorMsg) setErrorMsg(''); }}
          error={!!errorMsg}
        />
      </div>

      {/* Success / Error messages */}
      {successMsg && (
        <p className="text-green-400 text-[13px] text-center mb-4">{successMsg}</p>
      )}
      {errorMsg && (
        <p className="text-red-400 text-[13px] text-center mb-4">{errorMsg}</p>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-2 transition-all duration-200 active:scale-[0.98] bg-gradient-to-br from-accent to-[#7c5ce0] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
      >
        {saving ? t.saving : t.saveChanges}
      </button>

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full py-4 bg-transparent border border-border rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-4 transition-all duration-200 active:scale-[0.98] text-red-400 tracking-wide"
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
