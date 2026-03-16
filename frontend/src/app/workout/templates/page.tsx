'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { fetchTemplates, createTemplate, deleteTemplate, type Template } from '@/lib/api';
import { getGuestTemplates, saveGuestTemplate, deleteGuestTemplate, type GuestTemplate } from '@/lib/guest-storage';
import BottomSheet from '@/components/BottomSheet';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

// Unified template type for both guest and authenticated
interface TemplateItem {
  id: string | number;
  name: string;
  workout_type: string;
  exercises: { exercise_id: number; exercise_name: string; muscle_group: string; sort_order: number; mode: string; set_count: number }[];
}

function TemplatesPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const { isGuest } = useAuth();

  const workoutType = searchParams.get('type') || 'musculation';
  const date = searchParams.get('date') || '';
  const fromWorkoutId = searchParams.get('from');

  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [applyConfirmTemplate, setApplyConfirmTemplate] = useState<TemplateItem | null>(null);

  // Read current draft from localStorage to know exercise count for confirmation
  const getCurrentExerciseCount = useCallback((): number => {
    try {
      const storageKey = fromWorkoutId ? `strength-edit-${fromWorkoutId}` : `strength-draft-${date}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const entries = JSON.parse(raw);
        return Array.isArray(entries) ? entries.length : 0;
      }
    } catch { /* ignore */ }
    return 0;
  }, [fromWorkoutId, date]);

  // Read current draft exercises for creating template
  const getCurrentDraftEntries = useCallback((): { exercise_id: number; exercise_name: string; muscle_group: string; sort_order: number; mode: string; set_count: number }[] => {
    try {
      const storageKey = fromWorkoutId ? `strength-edit-${fromWorkoutId}` : `strength-draft-${date}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const entries = JSON.parse(raw);
        if (Array.isArray(entries)) {
          return entries.map((entry: { exercise: { id: number; name: string; muscleGroup: string }; sets: unknown[]; mode: string }, idx: number) => ({
            exercise_id: entry.exercise.id,
            exercise_name: entry.exercise.name,
            muscle_group: entry.exercise.muscleGroup,
            sort_order: idx,
            mode: entry.mode || 'reps-weight',
            set_count: entry.sets?.length || 3,
          }));
        }
      }
    } catch { /* ignore */ }
    return [];
  }, [fromWorkoutId, date]);

  // Load templates
  useEffect(() => {
    async function load() {
      try {
        if (isGuest) {
          const guestTemplates = getGuestTemplates(workoutType);
          setTemplates(guestTemplates);
        } else {
          const apiTemplates = await fetchTemplates(workoutType);
          setTemplates(apiTemplates);
        }
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isGuest, workoutType]);

  const handleBack = () => {
    const params = new URLSearchParams({ date });
    if (fromWorkoutId) params.set('id', fromWorkoutId);
    router.push(`/workout/strength?${params.toString()}`);
  };

  const handleCreateFromSession = () => {
    setShowCreateModal(false);
    setShowNameInput(true);
    setTemplateName('');
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    setSavingTemplate(true);

    try {
      const draftEntries = getCurrentDraftEntries();
      if (draftEntries.length === 0) {
        setSavingTemplate(false);
        return;
      }

      if (isGuest) {
        const saved = saveGuestTemplate({
          name: templateName.trim(),
          workout_type: workoutType,
          exercises: draftEntries,
        });
        setTemplates(prev => [saved, ...prev]);
      } else {
        const saved = await createTemplate({
          name: templateName.trim(),
          workout_type: workoutType,
          exercises: draftEntries.map(e => ({
            exercise_id: e.exercise_id,
            sort_order: e.sort_order,
            mode: e.mode,
            set_count: e.set_count,
          })),
        });
        setTemplates(prev => [saved, ...prev]);
      }

      setShowNameInput(false);
      setTemplateName('');
    } catch (err) {
      console.error('Failed to save template:', err);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmId === null) return;
    setDeleting(true);
    try {
      if (isGuest) {
        deleteGuestTemplate(String(deleteConfirmId));
      } else {
        await deleteTemplate(Number(deleteConfirmId));
      }
      setTemplates(prev => prev.filter(t => t.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete template:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleApplyTemplate = (template: TemplateItem) => {
    const currentCount = getCurrentExerciseCount();
    if (currentCount > 0) {
      setApplyConfirmTemplate(template);
    } else {
      applyTemplate(template);
    }
  };

  const applyTemplate = (template: TemplateItem) => {
    // Store template data in sessionStorage for the strength page to read
    sessionStorage.setItem('apply-template', JSON.stringify(template));

    // Navigate back with template flag
    const params = new URLSearchParams({ date, template: String(template.id) });
    if (fromWorkoutId) params.set('id', fromWorkoutId);
    router.push(`/workout/strength?${params.toString()}`);
  };

  // Get unique muscle groups for a template
  const getMuscleGroups = (template: TemplateItem): string[] => {
    return Array.from(new Set(template.exercises.map(e => e.muscle_group)));
  };

  const draftEntries = getCurrentDraftEntries();
  const draftMuscleGroups = Array.from(new Set(draftEntries.map(e => e.muscle_group)));

  if (loading) {
    return (
      <div className="page-container px-5 pb-36 lg:pb-20">
        <div className="flex items-center gap-3 pt-14 pb-5 lg:pt-8">
          <button onClick={handleBack} className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer text-base transition-all duration-150 active:scale-90 shrink-0">&#8249;</button>
          <span className="font-serif text-[22px] font-normal text-text">{t.templates}</span>
        </div>
        <div className="text-text-muted text-[13px] text-center py-8">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="page-container px-5 pb-36 lg:pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pt-14 pb-5 lg:pt-8">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer text-base transition-all duration-150 active:scale-90 shrink-0">&#8249;</button>
          <span className="font-serif text-[22px] font-normal text-text">{t.templates}</span>
        </div>
        {templates.length > 0 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-9 h-9 rounded-full bg-strength text-white flex items-center justify-center cursor-pointer border-none text-lg font-bold transition-all duration-150 active:scale-90"
          >
            +
          </button>
        )}
      </div>

      {/* Empty state */}
      {templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-strength/10 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-strength">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>
          <h3 className="text-[17px] font-semibold text-text mb-2">{t.noTemplates}</h3>
          <p className="text-[13px] text-text-muted max-w-[260px] mb-6">{t.noTemplatesDescription}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-full bg-strength text-white text-[14px] font-semibold cursor-pointer border-none transition-all duration-150 active:scale-95 shadow-[0_4px_20px_rgba(255,138,59,0.3)]"
          >
            {t.createTemplate}
          </button>
        </div>
      )}

      {/* Template cards */}
      <div className="space-y-3">
        {templates.map(template => (
          <div
            key={template.id}
            onClick={() => handleApplyTemplate(template)}
            className="bg-bg-card border border-border rounded-card p-4 cursor-pointer transition-all duration-150 active:scale-[0.98] relative"
          >
            {/* Delete button */}
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(template.id); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-bg hover:bg-red-500/10 flex items-center justify-center cursor-pointer border-none transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>

            <div className="font-semibold text-[15px] text-text mb-1 pr-10">{template.name}</div>
            <div className="text-[12px] text-text-muted mb-2.5">{t.templateExerciseCount(template.exercises.length)}</div>
            <div className="flex flex-wrap gap-1.5">
              {getMuscleGroups(template).map(mg => (
                <span key={mg} className="px-2 py-0.5 rounded-full bg-strength/10 text-strength text-[11px] font-medium">
                  {t.muscleGroups[mg] || mg}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      <BottomSheet open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div className="px-1 pb-2">
          <h3 className="text-[17px] font-semibold text-text mb-4">{t.createTemplate}</h3>
          <div className="space-y-3">
            <button
              onClick={handleCreateFromSession}
              disabled={draftEntries.length === 0}
              className="w-full text-left p-4 rounded-xl bg-bg border border-border transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="font-semibold text-[15px] text-text">{t.fromCurrentSession}</div>
              <div className="text-[12px] text-text-muted mt-1">{t.fromCurrentSessionDescription}</div>
              {draftEntries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] text-strength font-medium">{t.templateExerciseCount(draftEntries.length)}</span>
                  {draftMuscleGroups.map(mg => (
                    <span key={mg} className="px-2 py-0.5 rounded-full bg-strength/10 text-strength text-[11px] font-medium">
                      {t.muscleGroups[mg] || mg}
                    </span>
                  ))}
                </div>
              )}
            </button>

            <button
              onClick={() => {
                setShowCreateModal(false);
                const params = new URLSearchParams({ date, templateMode: '1' });
                if (fromWorkoutId) params.set('from', fromWorkoutId);
                router.push(`/workout/strength?${params.toString()}`);
              }}
              className="w-full text-left p-4 rounded-xl bg-bg border border-border transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
              <div className="font-semibold text-[15px] text-text">{t.createFromScratch}</div>
              <div className="text-[12px] text-text-muted mt-1">{t.createFromScratchDescription}</div>
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Name Input Bottom Sheet */}
      <BottomSheet open={showNameInput} onClose={() => setShowNameInput(false)}>
        <div className="px-1 pb-2">
          <h3 className="text-[17px] font-semibold text-text mb-4">{t.createTemplate}</h3>
          {draftEntries.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="text-[12px] text-text-muted">{t.templateExerciseCount(draftEntries.length)}</span>
              {draftMuscleGroups.map(mg => (
                <span key={mg} className="px-2 py-0.5 rounded-full bg-strength/10 text-strength text-[11px] font-medium">
                  {t.muscleGroups[mg] || mg}
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTemplate(); }}
            placeholder={t.templateNamePlaceholder}
            maxLength={100}
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-[15px] placeholder:text-text-muted/50 outline-none focus:border-strength transition-colors mb-4"
          />
          <button
            onClick={handleSaveTemplate}
            disabled={!templateName.trim() || savingTemplate}
            className="w-full py-3.5 rounded-xl bg-strength text-white text-[15px] font-semibold cursor-pointer border-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,138,59,0.3)]"
          >
            {savingTemplate ? t.saving : t.saveTemplate}
          </button>
        </div>
      </BottomSheet>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        deleting={deleting}
        message={t.deleteTemplateConfirm}
      />

      {/* Apply Confirmation */}
      {applyConfirmTemplate && (
        <>
          <div onClick={() => setApplyConfirmTemplate(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 z-[51] flex items-center justify-center px-8" onClick={() => setApplyConfirmTemplate(null)}>
            <div onClick={(e) => e.stopPropagation()}
              className="bg-bg-card border border-border rounded-card p-5 w-full max-w-[320px] animate-fadeIn">
              <h3 className="text-[15px] font-semibold mb-2">{t.applyTemplate} ?</h3>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
                {t.applyTemplateConfirm(getCurrentExerciseCount(), applyConfirmTemplate.exercises.length)}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setApplyConfirmTemplate(null)}
                  className="flex-1 py-2.5 bg-bg-elevated border border-border rounded-sm text-text text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
                  {t.cancel}
                </button>
                <button onClick={() => { applyTemplate(applyConfirmTemplate); setApplyConfirmTemplate(null); }}
                  className="flex-1 py-2.5 bg-strength/15 border border-strength/30 rounded-sm text-strength text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
                  {t.apply}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="page-container px-5 pt-14 text-text-muted text-center text-[13px]">Loading...</div>}>
      <TemplatesPageInner />
    </Suspense>
  );
}
