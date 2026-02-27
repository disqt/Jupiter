'use client';

import { useState, useEffect } from 'react';
import { SPORT_EMOJIS } from '@/lib/data';
import { useI18n } from '@/lib/i18n';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  currentEmoji: string;
  showSaveButton?: boolean;
}

export default function EmojiPicker({ isOpen, onClose, onSelect, currentEmoji, showSaveButton }: EmojiPickerProps) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(currentEmoji);

  useEffect(() => {
    if (isOpen) setSelected(currentEmoji);
  }, [isOpen, currentEmoji]);

  if (!isOpen) return null;

  const handleEmojiClick = (emoji: string) => {
    if (showSaveButton) {
      setSelected(emoji);
    } else {
      onSelect(emoji);
      onClose();
    }
  };

  const handleSave = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <>
      <div onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-overlayIn" />
      <div className="fixed inset-0 z-[51] flex items-center justify-center px-8" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()}
          className="bg-bg-card border border-border rounded-card p-5 w-full max-w-[320px] animate-fadeIn">
          <h3 className="text-[15px] font-semibold mb-4">{t.chooseEmoji}</h3>
          <div className="grid grid-cols-6 gap-1.5">
            {SPORT_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl cursor-pointer transition-all duration-150 active:scale-90 hover:bg-bg-elevated ${
                  emoji === selected ? 'ring-2 ring-accent bg-bg-elevated' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          {showSaveButton && (
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
          )}
        </div>
      </div>
    </>
  );
}
