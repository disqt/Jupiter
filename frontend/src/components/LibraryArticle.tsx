'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { LibraryArticle, ArticleBlock } from '@/lib/library-content';
import type { WorkoutType } from '@/lib/data';
import { SESSION_TYPE_COLORS, WORKOUT_CONFIG } from '@/lib/data';
import { useI18n } from '@/lib/i18n';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

interface Props {
  article: LibraryArticle;
  sportType: WorkoutType;
}

function useScrollReveal() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const setRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    refs.current[index] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = '1';
            (entry.target as HTMLElement).style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    refs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return setRef;
}

const LEVEL_COLORS = {
  beginner: { text: '#4ade80', bg: '#1a3a2a' },
  intermediate: { text: '#facc15', bg: '#2a2a1a' },
  advanced: { text: '#f87171', bg: '#3a1a1a' },
};

function HeroBlock({ block, article, sportType }: { block: Extract<ArticleBlock, { type: 'hero' }>; article: LibraryArticle; sportType: WorkoutType }) {
  const router = useRouter();
  const { t } = useI18n();
  const colors = SESSION_TYPE_COLORS[article.sessionType] || { text: '#c9a96e', bg: '#1a1b22' };
  const libraryPath = `${BASE_PATH}${WORKOUT_CONFIG[sportType].route}/library`;

  return (
    <div className="relative pb-8 pt-4 px-5" style={{ background: `linear-gradient(180deg, ${colors.bg} 0%, #0a0a0f 100%)` }}>
      <button
        onClick={() => router.push(libraryPath)}
        className="flex items-center gap-2 text-[13px] text-[#8b8a94] mb-6 active:opacity-70 transition-opacity"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {t.libraryMenuLabel} {t.librarySportNames[sportType]}
      </button>
      <span
        className="inline-block text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-4"
        style={{ color: colors.text, backgroundColor: colors.bg, border: `1px solid ${colors.text}30` }}
      >
        {t.sessionTypes[article.sessionType] || block.tag}
      </span>
      <h1 className="font-serif text-[28px] leading-tight text-white mb-3">{block.title}</h1>
      <p className="text-[13px] text-[#8b8a94] leading-relaxed">{block.subtitle}</p>
    </div>
  );
}

function BigNumbersBlock({ block, sessionType }: { block: Extract<ArticleBlock, { type: 'big-numbers' }>; sessionType: string }) {
  const colors = SESSION_TYPE_COLORS[sessionType] || { text: '#c9a96e' };
  return (
    <div className="flex gap-[1px] mx-5 rounded-xl overflow-hidden">
      {block.items.map((item, i) => (
        <div key={i} className="flex-1 bg-[#1a1b22] py-5 flex flex-col items-center">
          <span className="font-serif text-[28px] font-bold" style={{ color: colors.text }}>{item.value}</span>
          <span className="text-[10px] uppercase tracking-wider text-[#8b8a94] mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function IntroBlock({ block }: { block: Extract<ArticleBlock, { type: 'intro' }> }) {
  return (
    <div className="px-5">
      <h2 className="text-[16px] font-bold text-white mb-3">{block.title}</h2>
      <p className="text-[13px] text-[#c0bfc8] leading-[1.7]">{block.text}</p>
    </div>
  );
}

function BenefitsGridBlock({ block }: { block: Extract<ArticleBlock, { type: 'benefits-grid' }> }) {
  return (
    <div className="px-5">
      <h2 className="text-[16px] font-bold text-white mb-4">{block.title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {block.items.map((item, i) => (
          <div key={i} className="bg-bg-card border border-white/5 rounded-xl p-[14px]">
            <span className="text-[20px] block mb-2">{item.emoji}</span>
            <span className="text-[12px] font-bold text-white block mb-1">{item.title}</span>
            <span className="text-[11px] text-[#8b8a94] leading-relaxed block">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CautionBlock({ block }: { block: Extract<ArticleBlock, { type: 'caution' }> }) {
  const { locale } = useI18n();
  return (
    <div
      className="mx-5 rounded-xl p-5 border border-[#3a3500]"
      style={{ background: 'linear-gradient(135deg, #2a2000, #1a1b00)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[18px]">⚠️</span>
        <span className="text-[14px] font-bold text-[#facc15]">{locale === 'en' ? 'Cautions' : 'Précautions'}</span>
      </div>
      <ul className="space-y-2">
        {block.items.map((item, i) => (
          <li key={i} className="text-[12px] text-[#d4c77a] leading-relaxed flex gap-2">
            <span className="text-[#facc15] mt-px">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExamplesBlock({ block }: { block: Extract<ArticleBlock, { type: 'examples' }> }) {
  const { locale } = useI18n();
  const levelLabels: Record<string, string> = locale === 'en'
    ? { beginner: 'Beginner', intermediate: 'Inter.', advanced: 'Advanced' }
    : { beginner: 'Débutant', intermediate: 'Inter.', advanced: 'Avancé' };

  return (
    <div className="px-5">
      <h2 className="text-[16px] font-bold text-white mb-4">{block.title}</h2>
      <div className="space-y-3">
        {block.items.map((item, i) => {
          const lc = LEVEL_COLORS[item.level];
          return (
            <div key={i} className="bg-[#1a1b22] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[14px] font-semibold text-white">{item.name}</span>
                <span
                  className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                  style={{ color: lc.text, backgroundColor: lc.bg }}
                >
                  {levelLabels[item.level]}
                </span>
              </div>
              <div className="flex gap-4 mb-3">
                {item.metrics.map((m, j) => (
                  <div key={j}>
                    <span className="text-[10px] uppercase tracking-wider text-[#8b8a94] block">{m.label}</span>
                    <span className="text-[13px] font-bold text-white">{m.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[#8b8a94] leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TipBlock({ block, sessionType }: { block: Extract<ArticleBlock, { type: 'tip' }>; sessionType: string }) {
  const colors = SESSION_TYPE_COLORS[sessionType] || { text: '#c9a96e', bg: '#1a1b22' };
  return (
    <div
      className="mx-5 rounded-xl p-5"
      style={{ borderLeft: `3px solid ${colors.text}`, backgroundColor: colors.bg }}
    >
      <div className="flex gap-2">
        <span className="text-[16px] shrink-0">💡</span>
        <p className="text-[13px] text-[#c0bfc8] leading-relaxed">{block.text}</p>
      </div>
    </div>
  );
}

export default function LibraryArticleComponent({ article, sportType }: Props) {
  const setRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {article.blocks.map((block, i) => {
        if (block.type === 'hero') {
          return <HeroBlock key={i} block={block} article={article} sportType={sportType} />;
        }

        return (
          <div
            key={i}
            ref={setRef(i)}
            className="mt-6"
            style={{ opacity: 0, transform: 'translateY(16px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >
            {block.type === 'big-numbers' && <BigNumbersBlock block={block} sessionType={article.sessionType} />}
            {block.type === 'intro' && <IntroBlock block={block} />}
            {block.type === 'benefits-grid' && <BenefitsGridBlock block={block} />}
            {block.type === 'caution' && <CautionBlock block={block} />}
            {block.type === 'examples' && <ExamplesBlock block={block} />}
            {block.type === 'tip' && <TipBlock block={block} sessionType={article.sessionType} />}
          </div>
        );
      })}
    </div>
  );
}
