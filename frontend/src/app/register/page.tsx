'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import AuthIllustration from '@/components/AuthIllustration';

export default function RegisterPage() {
  const { t, locale } = useI18n();
  const { register, loading } = useAuth();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(nickname, password, inviteCode);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setSubmitting(false);
    }
  };

  const sessionLabel = locale === 'fr' ? 'SÉANCES' : 'SESSIONS';

  return (
    <div className="min-h-dvh flex">
      {/* Desktop: illustration panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center relative bg-bg-card border-r border-border overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(167,139,250,0.04) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #a78bfa 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="font-serif text-[38px] font-normal tracking-tight mb-10">
            <span className="text-accent">Jupiter</span>{' '}
            <span className="text-text-muted italic">Tracker</span>
          </h1>
          <AuthIllustration className="w-full max-w-[300px]" label={sessionLabel} />
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        {/* Mobile: illustration + title */}
        <div className="lg:hidden flex flex-col items-center mb-6">
          <AuthIllustration className="w-[200px] mb-2" label={sessionLabel} />
          <h1 className="font-serif text-[32px] font-normal tracking-tight">
            <span className="text-accent">Jupiter</span>{' '}
            <span className="text-text-muted italic">Tracker</span>
          </h1>
        </div>

        {/* Form card */}
        <div className="w-full max-w-sm bg-bg-card border border-border rounded-card p-6 animate-fadeIn">
          <h2 className="font-sans text-[18px] font-semibold text-text mb-5">{t.register}</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                {t.nickname}
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                autoComplete="username"
                required
                className="w-full py-3.5 px-4 bg-bg border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                {t.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full py-3.5 px-4 bg-bg border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                {t.inviteCode}
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                autoComplete="off"
                required
                className="w-full py-3.5 px-4 bg-bg border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted"
              />
            </div>

            {error && (
              <p className="text-red-400 text-[13px] mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer transition-all duration-200 active:scale-[0.98] bg-gradient-to-br from-accent to-[#7c5ce0] text-white shadow-[0_4px_20px_rgba(167,139,250,0.3)] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            >
              {submitting ? '...' : t.registerButton}
            </button>
          </form>

          <p className="text-center text-[13px] text-text-secondary mt-5">
            {t.hasAccount}{' '}
            <Link href="/login" className="text-accent font-medium hover:underline">
              {t.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
