'use client';

import { useState, useRef, useCallback, useEffect, type ReactElement } from 'react';

interface SwipeContainerProps {
  children: (goNext: () => void, goBack: () => void) => ReactElement[];
  onComplete: () => void;
  dotColor?: string;
}

export default function SwipeContainer({ children, onComplete, dotColor = '#c9a96e' }: SwipeContainerProps) {
  // Lock body scroll while onboarding is visible (prevents iOS background scrolling)
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const totalRef = useRef(0);

  const goTo = useCallback((index: number) => {
    const total = totalRef.current;
    if (index >= total) {
      onComplete();
      return;
    }
    setCurrentIndex(Math.max(0, Math.min(index, total - 1)));
  }, [onComplete]);

  const goNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }, [currentIndex]);

  const renderedSlides = children(goNext, goBack);
  const total = renderedSlides.length;
  totalRef.current = total;

  return (
    <div className="fixed inset-0 z-[60] bg-bg overflow-hidden">
      <div className="absolute top-[max(env(safe-area-inset-top,0px),12px)] left-0 right-0 z-10 flex justify-center gap-2 pt-4">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === currentIndex ? dotColor : '#2a2b32',
              boxShadow: i === currentIndex ? `0 0 8px ${dotColor}60` : 'none',
            }}
          />
        ))}
      </div>
      <div
        className="flex h-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {renderedSlides.map((child, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 overflow-y-auto overscroll-contain">
            <div className="min-h-full flex flex-col">
              {child}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
