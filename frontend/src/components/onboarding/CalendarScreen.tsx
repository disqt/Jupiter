'use client';

import { useI18n } from '@/lib/i18n';

interface Props {
  onNext: () => void;
  onBack?: () => void;
}

export default function CalendarScreen({ onNext, onBack }: Props) {
  const { t, locale } = useI18n();

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const workoutDays = [2, 5, 8, 11, 14, 17, 20, 23];
  const dayHeaders = locale === 'fr' ? ['L', 'M', 'M', 'J', 'V', 'S', 'D'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthNames = t.months;

  return (
    <div className="flex flex-col min-h-full px-6 pt-16 pb-[max(env(safe-area-inset-bottom,20px),20px)]">
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-2">
          {onBack && (
            <button onClick={onBack} className="text-secondary text-[20px] -ml-1 active:scale-95 transition-transform">←</button>
          )}
          <h1 className="font-serif text-[28px] text-text">{t.onboardingDiscoveryCalendarTitle}</h1>
        </div>
        <p className="text-secondary text-[15px] mb-6 leading-relaxed">{t.onboardingDiscoveryCalendarText}</p>

        <div className="bg-bg-card rounded-xl p-4 border border-border">
          <p className="text-center text-text font-semibold mb-3">
            {monthNames[month]} {year}
          </p>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayHeaders.map((d, i) => (
              <div key={i} className="text-center text-muted text-[11px] py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isWorkout = workoutDays.includes(day);
              const isToday = day === today.getDate();
              return (
                <div
                  key={day}
                  className={`text-center text-[12px] py-1.5 rounded-lg ${
                    isWorkout
                      ? 'bg-gradient-to-br from-[#c9a96e] to-[#a0833a] text-white font-semibold'
                      : isToday
                        ? 'border border-accent text-text'
                        : 'text-secondary'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="mt-6 w-full py-4 rounded-xl font-semibold text-[16px] text-white bg-gradient-to-br from-[#c9a96e] to-[#a0833a] active:scale-[0.98] transition-transform"
      >
        {t.onboardingNext}
      </button>
    </div>
  );
}
