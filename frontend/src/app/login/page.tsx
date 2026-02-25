'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
  const { t } = useI18n();
  const { login, loading } = useAuth();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(nickname, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5">
      <h1 className="font-serif text-[32px] font-normal tracking-tight mb-8">
        <span className="text-accent">Jupiter</span>{' '}
        <span className="text-text-muted italic">Tracker</span>
      </h1>

      <div className="w-full max-w-sm bg-bg-card border border-border rounded-card p-6">
        <h2 className="font-sans text-[18px] font-semibold text-text mb-5">{t.login}</h2>

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
              className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted"
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
              autoComplete="current-password"
              required
              className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent placeholder:text-text-muted"
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
            {submitting ? '...' : t.loginButton}
          </button>
        </form>

        <p className="text-center text-[13px] text-text-secondary mt-5">
          {t.noAccount}{' '}
          <Link href="/register" className="text-accent font-medium hover:underline">
            {t.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
