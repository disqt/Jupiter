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
      <div className="pt-14 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={() => router.push(sportRoute)}
            className="w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center text-text-muted text-sm"
          >
            ‹
          </button>
          <div>
            <h1 className="text-[24px] lg:text-[28px] font-serif text-text">{t.libraryMenuLabel}</h1>
            <p className="text-[12px] text-text-muted capitalize">{sportName} — {t.librarySubtitle(articles.length)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {articles.map((article) => {
          const colors = SESSION_TYPE_COLORS[article.sessionType] || { text: '#8b8a94', bg: '#1a1b22' };
          return (
            <button
              key={article.sessionType}
              type="button"
              onClick={() => router.push(`${sportRoute}/library/${article.sessionType}`)}
              className="bg-bg-card border border-border rounded-2xl p-4 text-left transition-all duration-150 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md mb-2"
                    style={{ color: colors.text, backgroundColor: colors.bg }}
                  >
                    {t.sessionTypes[article.sessionType] || article.sessionType}
                  </span>
                  <div className="text-[15px] font-semibold text-text mb-1">{article.title}</div>
                  <div className="text-[12px] text-text-muted line-clamp-2">{article.subtitle}</div>
                </div>
                <span className="text-text-muted text-lg ml-3">›</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
