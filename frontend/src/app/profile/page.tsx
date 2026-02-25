'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ProfilePage() {
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
    <div className="px-5 pb-20 lg:max-w-xl lg:mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pt-14 pb-5 lg:pt-8">
        <button
          onClick={() => router.push('/')}
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
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted"
        />
      </div>

      {/* Change password section */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
          {t.currentPassword}
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
          {t.newPassword}
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted"
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
