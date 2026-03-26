'use client';

import { I18nProvider } from '@/lib/i18n';
import { AuthProvider, useAuth } from '@/lib/auth';
import ErrorBoundary from '@/components/ErrorBoundary';
import SplashDismiss from '@/components/SplashDismiss';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { showOnboarding, setShowOnboarding, updateUser, user } = useAuth();

  if (showOnboarding) {
    return (
      <OnboardingFlow
        onDone={() => {
          setShowOnboarding(false);
          if (user) updateUser({ ...user, has_seen_onboarding: true });
        }}
      />
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <AuthProvider>
          <OnboardingGate>
            {children}
            <SplashDismiss />
          </OnboardingGate>
        </AuthProvider>
      </ErrorBoundary>
    </I18nProvider>
  );
}
