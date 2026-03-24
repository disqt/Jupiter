'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import WorkoutFormHeader from '@/components/WorkoutFormHeader';
import WorkoutRecap from '@/components/WorkoutRecap';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import type { UseWorkoutFormReturn } from '@/lib/useWorkoutForm';

interface WorkoutFormShellProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseWorkoutFormReturn<any>;
  color: string;
  shadowColor: string;
  deleteMessage?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

// Static map so Tailwind can detect classes at build time
const colorClasses: Record<string, string> = {
  cycling: 'bg-cycling',
  running: 'bg-running',
  swimming: 'bg-swimming',
  walking: 'bg-walking',
  'custom-workout': 'bg-custom-workout',
  strength: 'bg-strength',
};

export default function WorkoutFormShell({ form, color, shadowColor, deleteMessage, headerRight, children }: WorkoutFormShellProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { isGuest } = useAuth();

  return (
    <div className="page-container px-5 pb-36 lg:pb-20">
      <WorkoutFormHeader {...form.headerProps} headerRight={headerRight} />

      {children}

      {form.loadingWorkout && (
        <div className="text-text-muted text-[13px] text-center py-8">{t.loadingWorkout}</div>
      )}

      {form.recapData && <WorkoutRecap data={form.recapData} onComplete={() => router.push('/calendar')} isGuest={isGuest} />}

      {form.saveError && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-[13px] text-center">
          {form.saveError}
        </div>
      )}

      {(!form.workoutId || form.editing) && (
        <button onClick={form.handleSave} disabled={form.saving}
          className={`w-full py-4 border-none rounded-card font-inherit text-[15px] font-semibold cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98] ${colorClasses[color] || ''} text-white disabled:opacity-50 disabled:cursor-not-allowed tracking-wide`}
          style={{ boxShadow: `0 4px 20px ${shadowColor}` }}>
          {form.saving ? t.saving : t.save}
        </button>
      )}

      {form.workoutId && !form.editing && (
        <button onClick={() => form.setEditing(true)}
          className="w-full py-3.5 bg-bg-elevated border border-border rounded-card text-text text-[14px] font-medium font-inherit cursor-pointer mt-6 transition-all duration-200 active:scale-[0.98]">
          {t.editWorkout}
        </button>
      )}
      {form.workoutId && (
        <button onClick={() => form.setShowDeleteConfirm(true)}
          className="w-full py-3.5 bg-transparent border border-border rounded-card text-red-400 text-[14px] font-medium font-inherit cursor-pointer mt-3 transition-all duration-200 active:scale-[0.98] active:bg-red-500/10">
          {t.deleteWorkout}
        </button>
      )}
      {!form.workoutId && form.hasDraft && (
        <button onClick={form.deleteDraft}
          className="w-full py-3.5 bg-transparent border border-border rounded-card text-red-400 text-[14px] font-medium font-inherit cursor-pointer mt-3 transition-all duration-200 active:scale-[0.98] active:bg-red-500/10">
          {t.deleteDraft}
        </button>
      )}

      <DeleteConfirmModal
        open={form.showDeleteConfirm}
        onClose={() => form.setShowDeleteConfirm(false)}
        onConfirm={form.confirmDelete}
        deleting={form.deleting}
        message={deleteMessage}
      />
    </div>
  );
}
