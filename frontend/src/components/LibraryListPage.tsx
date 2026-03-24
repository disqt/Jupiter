'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getArticlesForSport } from '@/lib/library-content';
import { SESSION_TYPE_COLORS, WORKOUT_CONFIG } from '@/lib/data';
import type { WorkoutType } from '@/lib/data';

interface Props {
  sportType: WorkoutType;
}

export default function LibraryListPage({ sportType }: Props) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const articles = getArticlesForSport(sportType, locale);
  const sportRoute = WORKOUT_CONFIG[sportType].route;
  const sportName = t.librarySportNames[sportType] || sportType;

  return (
    <div className="page-container px-5 pb-36 lg:pb-20">
      <div className="pt-14 pb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(sportRoute)}
            className="w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center text-text-muted text-sm"
          >
            ‹
          </button>
          <div>
            <h1 className="text-[32px] lg:text-[38px] font-serif text-text">{t.libraryMenuLabel}</h1>
            <p className="text-[12px] text-text-muted capitalize">{sportName} — {t.librarySubtitle(articles.length)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {articles.map((article, index) => {
          const colors = SESSION_TYPE_COLORS[article.sessionType] || { text: '#8b8a94', bg: '#1a1b22' };
          return (
            <button
              key={article.sessionType}
              type="button"
              onClick={() => router.push(`${sportRoute}/library/${article.sessionType}`)}
              className="group relative overflow-hidden rounded-2xl text-left transition-all duration-300 active:scale-[0.98]"
              style={{
                animationDelay: `${index * 80}ms`,
                animation: 'fadeSlideUp 0.4s ease both',
              }}
            >
              {/* Gradient background matching article hero */}
              <div
                className="absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${colors.bg} 0%, #12121a 70%)` }}
              />
              {/* Left accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                style={{ backgroundColor: colors.text }}
              />
              {/* Content */}
              <div className="relative p-4 pl-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-2.5"
                      style={{ color: colors.text, border: `1px solid ${colors.text}30`, backgroundColor: `${colors.bg}` }}
                    >
                      {t.sessionTypes[article.sessionType] || article.sessionType}
                    </span>
                    <div className="font-serif text-[17px] leading-snug text-white mb-1.5 group-hover:text-white/90 transition-colors">
                      {article.title}
                    </div>
                    <div className="text-[12px] text-[#8b8a94] leading-relaxed line-clamp-2">
                      {article.subtitle}
                    </div>
                  </div>
                  <div
                    className="shrink-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5"
                    style={{ backgroundColor: `${colors.text}15` }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
