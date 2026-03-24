'use client';

// Deprecated: replaced by WorkoutRecap. To be removed in Task 9.
import { useEffect } from 'react';

interface SaveAnimationProps {
  onComplete: () => void;
}

export default function SaveAnimation({ onComplete }: SaveAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1900);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return null;
}
