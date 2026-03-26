'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { completeOnboarding } from '@/lib/api';
import SwipeContainer from './SwipeContainer';
import WelcomeScreen from './WelcomeScreen';
import GoalScreen from './GoalScreen';
import MedalScreen from './MedalScreen';
import SportsScreen from './SportsScreen';
import CalendarScreen from './CalendarScreen';
import ReadyScreen from './ReadyScreen';

interface Props {
  onDone: () => void;
}

export default function OnboardingFlow({ onDone }: Props) {
  const { user } = useAuth();
  const [weeklyGoal, setWeeklyGoal] = useState(3);

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
      {(goNext, goBack) => [
        <WelcomeScreen key="welcome" username={user?.nickname || ''} onNext={goNext} />,
        <GoalScreen key="goal" onNext={goNext} onGoalSelected={setWeeklyGoal} onBack={goBack} />,
        <MedalScreen key="medal" onNext={goNext} weeklyGoal={weeklyGoal} onBack={goBack} />,
        <SportsScreen key="sports" onNext={goNext} onBack={goBack} />,
        <CalendarScreen key="calendar" onNext={goNext} onBack={goBack} />,
        <ReadyScreen key="ready" onComplete={handleComplete} onBack={goBack} />,
      ]}
    </SwipeContainer>
  );
}
