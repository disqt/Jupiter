'use client';

import { SPORT_EMOJIS } from '@/lib/data';
import { useI18n } from '@/lib/i18n';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  currentEmoji: string;
}

export default function EmojiPicker({ isOpen, onClose, onSelect, currentEmoji }: EmojiPickerProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

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
                onClick={() => { onSelect(emoji); onClose(); }}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl cursor-pointer transition-all duration-150 active:scale-90 hover:bg-bg-elevated ${
                  emoji === currentEmoji ? 'ring-2 ring-accent bg-bg-elevated' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
