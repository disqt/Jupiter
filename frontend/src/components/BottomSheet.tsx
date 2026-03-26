'use client';

import { useRef, useCallback, useEffect } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  desktopSidebarOffset?: boolean;
  fullScreenMobile?: boolean;
}

export default function BottomSheet({
  open,
  onClose,
  children,
  className = '',
  desktopSidebarOffset = false,
  fullScreenMobile = false,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isDragging = useRef(false);

  // Reset transform when sheet opens
  useEffect(() => {
    if (open && sheetRef.current) {
      sheetRef.current.style.transform = '';
      sheetRef.current.style.transition = '';
    }
  }, [open]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Keep focused input visible when virtual keyboard opens
  // Only apply translateY for non-fullscreen sheets (anchored to bottom).
  // For fullscreen sheets, use scrollIntoView instead to avoid pushing content off-screen.
  useEffect(() => {
    if (!open || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const handleResize = () => {
      const sheet = sheetRef.current;
      if (!sheet) return;
      const focused = sheet.querySelector(':focus') as HTMLElement | null;
      if (!focused || (focused.tagName !== 'INPUT' && focused.tagName !== 'TEXTAREA')) return;
      const keyboardHeight = window.innerHeight - viewport.height;
      if (keyboardHeight > 50) {
        if (fullScreenMobile) {
          // For fullscreen sheets: scroll the input into view instead of moving the sheet
          focused.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // For bottom sheets: offset just enough to keep the focused input visible above keyboard
          const inputRect = focused.getBoundingClientRect();
          const inputBottom = inputRect.bottom + 20; // 20px breathing room
          const visibleBottom = viewport.height;
          const offset = Math.max(0, inputBottom - visibleBottom);
          if (offset > 0) {
            sheet.style.transition = 'transform 0.2s ease-out';
            sheet.style.transform = `translateY(-${offset}px)`;
          }
        }
      } else if (!fullScreenMobile) {
        sheet.style.transform = '';
      }
    };
    viewport.addEventListener('resize', handleResize);
    // Reset when focus leaves inputs (only for non-fullscreen)
    const handleBlur = (e: FocusEvent) => {
      if (fullScreenMobile) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setTimeout(() => {
          if (sheetRef.current) {
            sheetRef.current.style.transition = 'transform 0.2s ease-out';
            sheetRef.current.style.transform = '';
          }
        }, 100);
      }
    };
    const sheet = sheetRef.current;
    sheet?.addEventListener('focusout', handleBlur);
    return () => {
      viewport.removeEventListener('resize', handleResize);
      sheet?.removeEventListener('focusout', handleBlur);
    };
  }, [open, fullScreenMobile]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // If the touch target is inside a scrollable area that has scrolled, let native scroll work
    const target = e.target as HTMLElement;
    const scrollContainer = target.closest('[data-bottom-sheet-scroll]');
    if (scrollContainer && scrollContainer.scrollTop > 0) {
      isDragging.current = false;
      return;
    }

    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isDragging.current = true;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return;

    const delta = e.touches[0].clientY - touchStartY.current;

    // Only allow downward swipe (positive delta)
    if (delta <= 0) {
      sheetRef.current.style.transform = 'translateY(0)';
      return;
    }

    sheetRef.current.style.transition = 'none';
    sheetRef.current.style.transform = `translateY(${delta}px)`;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return;
    isDragging.current = false;

    const delta = e.changedTouches[0].clientY - touchStartY.current;
    const elapsed = Date.now() - touchStartTime.current;
    const velocity = delta / elapsed; // px/ms

    if (delta > 100 || velocity > 0.5) {
      // Dismiss: animate sheet off-screen then call onClose
      sheetRef.current.style.transition = 'transform 0.2s ease-out';
      sheetRef.current.style.transform = 'translateY(100%)';
      setTimeout(() => {
        onClose();
      }, 200);
    } else {
      // Snap back
      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      sheetRef.current.style.transform = 'translateY(0)';
    }
  }, [onClose]);

  if (!open) return null;

  const sidebarOffset = desktopSidebarOffset ? 'lg:left-[200px]' : '';

  if (fullScreenMobile) {
    return (
      <>
        <div
          onClick={onClose}
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn ${sidebarOffset}`}
        />
        <div
          ref={sheetRef}
          className={`fixed inset-0 max-w-[430px] lg:max-w-lg mx-auto z-[51] bg-bg-card animate-sheetUp flex flex-col lg:inset-x-0 lg:bottom-0 lg:top-auto lg:rounded-t-3xl lg:max-h-[85dvh] ${sidebarOffset} ${className}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="w-9 h-1 bg-border rounded-full mx-auto mt-3 mb-2 cursor-grab hidden lg:block" />
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn ${sidebarOffset}`}
      />
      <div className={`fixed bottom-0 left-0 right-0 z-[51] ${sidebarOffset}`}>
        <div
          ref={sheetRef}
          className={`max-w-[430px] lg:max-w-xl mx-auto bg-bg-card rounded-t-3xl px-6 pt-3 pb-10 animate-sheetUp ${className}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="w-9 h-1 bg-border rounded-full mx-auto mb-5 cursor-grab" />
          {children}
        </div>
      </div>
    </>
  );
}
