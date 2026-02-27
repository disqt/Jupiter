'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

interface NameEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  currentName: string;
  defaultName: string;
}

export default function NameEditor({ isOpen, onClose, onSave, currentName, defaultName }: NameEditorProps) {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue(currentName || defaultName);
    }
  }, [isOpen, currentName, defaultName]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed === defaultName) {
      onSave('');
    } else {
      onSave(trimmed);
    }
    onClose();
  };

  return (
    <>
      <div onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
      <div className="fixed inset-0 z-[51] flex items-center justify-center px-8" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()}
          className="bg-bg-card border border-border rounded-card p-5 w-full max-w-[320px] animate-fadeIn">
          <h3 className="text-[15px] font-semibold mb-4">{t.editName}</h3>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
            {t.workoutName}
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            autoFocus
            className="w-full py-3.5 px-4 bg-bg border border-border rounded-sm text-text font-inherit text-[15px] outline-none transition-colors duration-200 focus:border-accent"
          />
          <div className="flex gap-2 mt-4">
            <button onClick={onClose}
              className="flex-1 py-2.5 bg-bg-elevated border border-border rounded-sm text-text text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
              {t.cancel}
            </button>
            <button onClick={handleSave}
              className="flex-1 py-2.5 bg-accent/15 border border-accent/30 rounded-sm text-accent text-[13px] font-medium font-inherit cursor-pointer transition-all duration-150 active:scale-[0.98]">
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
