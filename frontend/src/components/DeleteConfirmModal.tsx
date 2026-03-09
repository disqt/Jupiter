'use client';

import { useI18n } from '@/lib/i18n';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
  message?: string;
}

export default function DeleteConfirmModal({ open, onClose, onConfirm, deleting, message }: DeleteConfirmModalProps) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <>
      <div onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
      <div className="fixed inset-0 z-[51] flex items-center justify-center px-8" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()}
          className="bg-bg-card border border-border rounded-card p-5 w-full max-w-[320px] animate-fadeIn">
          <h3 className="text-[15px] font-semibold mb-2">{t.deleteConfirmTitle}</h3>
          <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
            {message ?? t.deleteConfirmGeneric}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 bg-bg-elevated border border-border rounded-sm text-text text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
              {t.cancel}
            </button>
            <button onClick={onConfirm} disabled={deleting}
              className="flex-1 py-2.5 bg-red-500/15 border border-red-500/30 rounded-sm text-red-400 text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98] disabled:opacity-50">
              {deleting ? t.deleting : t.delete}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
