'use client';

import { useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { completeOnboarding } from '@/lib/api';
import SwipeContainer from './SwipeContainer';
import WelcomeScreen from './WelcomeScreen';
import GoalScreen from './GoalScreen';
import MedalScreen from './MedalScreen';
import DiscoveryScreen from './DiscoveryScreen';

interface Props {
  onDone: () => void;
}

export default function OnboardingFlow({ onDone }: Props) {
  const { user } = useAuth();

  const handleComplete = useCallback(async () => {
    try {
      await completeOnboarding();
    } catch {
      // Non-blocking
    }
    onDone();
  }, [onDone]);

  return (
    <SwipeContainer onComplete={handleComplete}>
      {(goNext) => [
        <WelcomeScreen key="welcome" username={user?.nickname || ''} onNext={goNext} />,
        <GoalScreen key="goal" onNext={goNext} />,
        <MedalScreen key="medal" onNext={goNext} />,
        <DiscoveryScreen key="discovery" onComplete={handleComplete} />,
      ]}
    </SwipeContainer>
  );
}
