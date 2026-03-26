'use client';

import { useState, useRef, useCallback, type ReactElement } from 'react';

interface SwipeContainerProps {
  children: (goNext: () => void) => ReactElement[];
  onComplete: () => void;
  dotColor?: string;
}

export default function SwipeContainer({ children, onComplete, dotColor = '#c9a96e' }: SwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const goNextRef = useRef<() => void>(() => {});
  const totalRef = useRef(0);

  const goTo = useCallback((index: number) => {
    const total = totalRef.current;
    if (index >= total) {
      onComplete();
      return;
    }
    setCurrentIndex(Math.max(0, Math.min(index, total - 1)));
    setOffsetX(0);
  }, [onComplete]);

  const goNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  goNextRef.current = goNext;

  const renderedSlides = children(goNext);
  const total = renderedSlides.length;
  totalRef.current = total;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;
    if (!isSwiping && Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStartRef.current = null;
      return;
    }
    setIsSwiping(true);
    if ((currentIndex === 0 && deltaX > 0) || (currentIndex === total - 1 && deltaX < 0)) {
      setOffsetX(deltaX * 0.3);
    } else {
      setOffsetX(deltaX);
    }
  }, [currentIndex, total, isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;
    const threshold = 50;
    const velocity = Math.abs(offsetX) / (Date.now() - touchStartRef.current.time);
    if (offsetX < -threshold || (velocity > 0.5 && offsetX < 0)) {
      goTo(currentIndex + 1);
    } else if (offsetX > threshold || (velocity > 0.5 && offsetX > 0)) {
      goTo(currentIndex - 1);
    } else {
      setOffsetX(0);
    }
    touchStartRef.current = null;
    setIsSwiping(false);
  }, [offsetX, currentIndex, goTo]);

  return (
    <div className="fixed inset-0 z-[60] bg-bg overflow-hidden">
      <div className="absolute top-[max(env(safe-area-inset-top,0px),12px)] left-0 right-0 z-10 flex justify-center gap-1.5 pt-3">
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
          transform: `translateX(calc(-${currentIndex * 100}% + ${offsetX}px))`,
          transition: isSwiping ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {renderedSlides.map((child, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 overflow-y-auto">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
