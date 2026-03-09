'use client';

import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <AuthProvider>{children}</AuthProvider>
      </ErrorBoundary>
    </I18nProvider>
  );
}
