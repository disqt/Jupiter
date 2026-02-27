'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import EmojiPicker from '@/components/EmojiPicker';
import NameEditor from '@/components/NameEditor';

interface WorkoutFormHeaderProps {
  emoji: string;
  name: string;
  defaultName: string;
  onEmojiChange: (emoji: string) => void;
  onNameChange: (name: string) => void;
  onBack: () => void;
  dateDisplay: string;
  hasDraft?: boolean;
  onPersistMeta?: (emoji: string, name: string) => void;
}

export default function WorkoutFormHeader({
  emoji,
  name,
  defaultName,
  onEmojiChange,
  onNameChange,
  onBack,
  dateDisplay,
  hasDraft,
  onPersistMeta,
}: WorkoutFormHeaderProps) {
  const { t } = useI18n();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);

  const displayName = name || defaultName;

  const handleEmojiSelect = (newEmoji: string) => {
    onEmojiChange(newEmoji);
    if (onPersistMeta) {
      onPersistMeta(newEmoji, name);
    }
  };

  const handleNameSave = (newName: string) => {
    onNameChange(newName);
    if (onPersistMeta) {
      onPersistMeta(emoji, newName);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 pt-14 pb-5 lg:pt-8">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-bg-card border border-border text-text-secondary flex items-center justify-center cursor-pointer text-base transition-all duration-150 active:scale-90 shrink-0"
        >
          &#8249;
        </button>
        <button
          onClick={() => setShowEmojiPicker(true)}
          className="w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center cursor-pointer text-base transition-all duration-150 active:scale-90 shrink-0"
        >
          {emoji}
        </button>
        <button
          onClick={() => setShowNameEditor(true)}
          className="flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
        >
          <span className="font-serif text-[22px] font-normal text-text">{displayName}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted shrink-0">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
      </div>

      <div className="text-[13px] text-text-muted mb-1 pl-12 capitalize">{dateDisplay}</div>
      {hasDraft && (
        <div className="text-[11px] text-accent font-medium pl-12 mb-6">{t.unsavedChanges}</div>
      )}
      {!hasDraft && <div className="mb-5" />}

      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleEmojiSelect}
        currentEmoji={emoji}
        showSaveButton={!!onPersistMeta}
      />

      <NameEditor
        isOpen={showNameEditor}
        onClose={() => setShowNameEditor(false)}
        onSave={handleNameSave}
        currentName={name}
        defaultName={defaultName}
      />
    </>
  );
}
