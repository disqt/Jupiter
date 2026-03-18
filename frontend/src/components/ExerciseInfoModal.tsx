'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { getCatalogExercise, getCatalogDetails, getExerciseImageUrl, type CatalogDetails } from '@/lib/exercise-catalog';

interface ExerciseInfoModalProps {
  catalogId: string;
  exerciseName: string;
  muscleGroup: string;
  open: boolean;
  onClose: () => void;
}

export default function ExerciseInfoModal({ catalogId, exerciseName, muscleGroup, open, onClose }: ExerciseInfoModalProps) {
  const { t, locale } = useI18n();
  const [details, setDetails] = useState<CatalogDetails | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const catalogEntry = getCatalogExercise(catalogId);

  useEffect(() => {
    if (open && catalogId) {
      setDetails(getCatalogDetails(catalogId) || null);
      setCurrentSlide(0);
    }
  }, [open, catalogId]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentSlide(s => Math.max(0, s - 1));
      if (e.key === 'ArrowRight' && details) setCurrentSlide(s => Math.min(details.images.length - 1, s + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, details]);

  if (!open) return null;

  const images = details?.images || [];
  const equipment = catalogEntry?.equipment;
  const displayName = locale === 'fr' ? (catalogEntry?.name_fr || exerciseName) : (catalogEntry?.name_en || exerciseName);

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

      {/* Modal container */}
      <div className="fixed inset-0 z-[51] flex items-center justify-center px-4" onClick={onClose}>
        <div
          onClick={e => e.stopPropagation()}
          className="bg-bg-card border border-border rounded-[20px] w-full max-w-[400px] max-h-[85vh] overflow-y-auto animate-fadeIn relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center bg-bg-elevated border border-border rounded-full text-text-secondary cursor-pointer z-[2] transition-colors duration-150 hover:bg-bg-card-hover hover:text-text"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Header */}
          <div className="px-5 pt-5">
            <h3 className="font-serif font-normal text-[24px] leading-tight pr-10">{displayName}</h3>
            <div className="text-[12px] text-strength font-medium mt-1">
              {t.muscleGroups?.[muscleGroup] || muscleGroup}
            </div>
          </div>

          {/* Image carousel */}
          {images.length > 0 && (
            <div className="relative mx-5 mt-4 bg-bg rounded-sm overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {images.map((_, idx) => (
                  <div key={idx} className="min-w-full h-full flex items-center justify-center">
                    <img
                      src={getExerciseImageUrl(catalogId)}
                      alt={`${displayName} - ${idx + 1}`}
                      className="max-w-[85%] max-h-[85%] object-contain"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                ))}
              </div>

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentSlide(s => Math.max(0, s - 1))}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-bg-card border border-border rounded-full text-text cursor-pointer shadow-lg transition-all duration-150 hover:bg-bg-elevated active:scale-[0.92]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentSlide(s => Math.min(images.length - 1, s + 1))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-bg-card border border-border rounded-full text-text cursor-pointer shadow-lg transition-all duration-150 hover:bg-bg-elevated active:scale-[0.92]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Carousel dots */}
          {images.length > 1 && (
            <div className="flex justify-center gap-1.5 pt-2.5 pb-1">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full border-none cursor-pointer transition-all duration-200 p-0 ${
                    idx === currentSlide ? 'w-[18px] bg-strength' : 'w-1.5 bg-text-muted'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Body */}
          <div className="px-5 pt-3 pb-6">
            {/* No catalog data fallback */}
            {!catalogEntry && !details && (
              <p className="text-[13px] text-text-muted text-center py-6">{t.noExerciseInfo}</p>
            )}
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {equipment && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-strength-soft text-strength border border-strength/20">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2v6M18 2v6M6 16v6M18 16v6M2 10h4v4H2zM18 10h4v4h-4zM6 11h12" />
                  </svg>
                  {t.equipmentLabels?.[equipment] || equipment}
                </span>
              )}
              {details?.level && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-accent/10 text-accent border border-accent/20">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {t.levelLabels?.[details.level] || details.level}
                </span>
              )}
              {details?.force && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-running/10 text-running border border-running/20">
                  {t.forceLabels?.[details.force] || details.force}
                </span>
              )}
              {details?.mechanic && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-swimming/10 text-swimming border border-swimming/20">
                  {t.mechanicLabels?.[details.mechanic] || details.mechanic}
                </span>
              )}
            </div>

            {/* Muscles */}
            {details && (details.primaryMuscles.length > 0 || details.secondaryMuscles.length > 0) && (
              <>
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">{t.targetMuscles}</div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {details.primaryMuscles.map(m => (
                    <span key={m} className="px-2.5 py-1 rounded-md text-[12px] font-medium bg-strength-soft text-strength">
                      {t.muscleGroups?.[m] || m}
                    </span>
                  ))}
                  {details.secondaryMuscles.map(m => (
                    <span key={m} className="px-2.5 py-1 rounded-md text-[12px] font-medium bg-bg-elevated text-text-secondary">
                      {t.muscleGroups?.[m] || m}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Instructions */}
            {details?.instructions && details.instructions.length > 0 && (
              <>
                <div className="h-px bg-border my-4" />
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">{t.instructions}</div>
                <ol className="list-none p-0 m-0">
                  {details.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-3 mb-3 text-[13px] leading-relaxed text-text-secondary">
                      <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-bg-elevated border border-border rounded-full text-[11px] font-semibold text-text-muted mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
