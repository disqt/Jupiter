'use client';

import { useState, useEffect } from 'react';
import BodyMuscleSelector from './BodyMuscleSelector';
import { generateWorkout, type GeneratedExercise, type GeneratorInput } from '@/lib/workout-generator';
import { EXERCISE_CATALOG } from '@/lib/exercise-catalog-index';
import { getAllCatalogDetails } from '@/lib/exercise-catalog';
import { useI18n } from '@/lib/i18n';

interface WorkoutGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (exercises: GeneratedExercise[], input: GeneratorInput) => void;
  userLevel?: number;
}

type Level = GeneratorInput['level'];

const EQUIPMENT_OPTIONS = [
  'body_only',
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'kettlebells',
  'bands',
] as const;

const EQUIPMENT_KEYS: Record<string, string> = {
  body_only: 'generatorBodyOnly',
  barbell: 'generatorBarbell',
  dumbbell: 'generatorDumbbell',
  cable: 'generatorCable',
  machine: 'generatorMachine',
  kettlebells: 'generatorKettlebells',
  bands: 'generatorBands',
};

const EQUIPMENT_ICONS: Record<string, string> = {
  body_only: '🤸',
  barbell: '🏋️',
  dumbbell: '💪',
  cable: '🔗',
  machine: '⚙️',
  kettlebells: '🔔',
  bands: '🎗️',
};

const TOTAL_STEPS = 5;

function levelFromUserLevel(userLevel?: number): Level {
  if (userLevel === undefined || userLevel === 0) return 'beginner';
  if (userLevel <= 3) return 'intermediate';
  return 'expert';
}

interface SavedPrefs {
  muscles: string[];
  weeklyFrequency?: 2 | 3 | 4 | 5;
  level: Level;
  equipment: string[];
}

function loadPrefs(): SavedPrefs | null {
  try {
    const raw = localStorage.getItem('generator-prefs');
    if (!raw) return null;
    return JSON.parse(raw) as SavedPrefs;
  } catch {
    return null;
  }
}

export default function WorkoutGeneratorModal({ open, onClose, onGenerate, userLevel }: WorkoutGeneratorModalProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [weeklyFrequency, setWeeklyFrequency] = useState<2 | 3 | 4 | 5>(3);
  const [level, setLevel] = useState<Level>(() => levelFromUserLevel(userLevel));
  const [equipment, setEquipment] = useState<string[]>(['body_only']);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prefs = loadPrefs();
    if (prefs) {
      if (prefs.muscles.length > 0) setSelectedMuscles(prefs.muscles);
      if (prefs.weeklyFrequency) setWeeklyFrequency(prefs.weeklyFrequency);
      if (prefs.level) setLevel(prefs.level);
      if (prefs.equipment.length > 0) setEquipment(prefs.equipment);
    } else {
      setWeeklyFrequency(3);
      setLevel(levelFromUserLevel(userLevel));
      setEquipment(['body_only']);
    }
    setStep(1);
    setWarnings([]);
  }, [open, userLevel]);

  if (!open) return null;

  const toggleEquipment = (eq: string) => {
    setEquipment(prev =>
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setWarnings([]);
    try {
      const allDetails = await getAllCatalogDetails();
      const result = generateWorkout({ selectedMuscles, level, equipment, weeklyFrequency }, EXERCISE_CATALOG, allDetails);
      localStorage.setItem('generator-prefs', JSON.stringify({ muscles: selectedMuscles, weeklyFrequency, level, equipment }));

      if (result.warnings.length > 0) {
        const translated = result.warnings.map(w => {
          if (w.startsWith('notEnoughExercises:')) {
            const muscle = w.split(':')[1];
            return `${t.generatorWarnNotEnough} (${t.muscleGroups[muscle] || muscle})`;
          }
          if (w === 'pushOnlyWarning') return t.generatorWarnPushOnly;
          if (w === 'pushPullRatioWarning') return t.generatorWarnPushPullRatio;
          return w;
        });
        setWarnings(translated);
      }

      if (result.exercises.length === 0) {
        setWarnings([t.generatorWarnNoResults]);
        setGenerating(false);
        return;
      }

      onGenerate(result.exercises, { selectedMuscles, level, equipment, weeklyFrequency });
    } catch {
      setWarnings([t.generatorWarnNoResults]);
    } finally {
      setGenerating(false);
    }
  };

  const levelOptions: { value: Level; labelKey: 'generatorBeginner' | 'generatorIntermediate' | 'generatorExpert'; icon: string; desc: string }[] = [
    { value: 'beginner', labelKey: 'generatorBeginner', icon: '🌱', desc: 'Exercices simples et accessibles' },
    { value: 'intermediate', labelKey: 'generatorIntermediate', icon: '🔥', desc: 'Mouvements variés et techniques' },
    { value: 'expert', labelKey: 'generatorExpert', icon: '⚡', desc: 'Exercices avancés et complexes' },
  ];

  const frequencyOptions: { value: 2 | 3 | 4 | 5; label: string; desc: string }[] = [
    { value: 2, label: '2x', desc: 'Volume élevé par séance' },
    { value: 3, label: '3x', desc: 'Équilibre idéal' },
    { value: 4, label: '4x', desc: 'Séances plus courtes' },
    { value: 5, label: '5-6x', desc: 'Haute fréquence' },
  ];

  const stepTitles = [
    t.generatorMusclesStep,
    t.generatorFrequencyStep,
    t.generatorLevelStep,
    t.generatorEquipmentStep,
    t.generatorSummaryStep,
  ];

  const canNext = step === 1 ? selectedMuscles.length > 0 : step === 4 ? equipment.length > 0 : true;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-bg text-text w-full h-full max-w-lg mx-auto flex flex-col lg:h-auto lg:max-h-[90vh] lg:rounded-2xl overflow-hidden">
        {/* Header with progress bar */}
        <div className="shrink-0">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <button
              onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-bg-card border border-border text-text-secondary cursor-pointer transition-all duration-150 active:scale-90"
            >
              {step === 1 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              )}
            </button>
            <div className="text-center">
              <span className="text-[11px] text-text-muted uppercase tracking-widest font-medium">{t.generatorTitle}</span>
              <div className="text-[10px] text-text-muted mt-0.5">{step}/{TOTAL_STEPS}</div>
            </div>
            <div className="w-9" />
          </div>

          {/* Progress bar */}
          <div className="px-4 pb-3">
            <div className="h-1 bg-bg-card rounded-full overflow-hidden">
              <div
                className="h-full bg-strength rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step title */}
        <div className="px-5 pb-3">
          <h2 className="text-[20px] font-semibold">{stepTitles[step - 1]}</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {/* Step 1: Muscles */}
          {step === 1 && (
            <BodyMuscleSelector selected={selectedMuscles} onSelectionChange={setSelectedMuscles} />
          )}

          {/* Step 2: Frequency */}
          {step === 2 && (
            <div>
              <p className="text-[13px] text-text-muted leading-relaxed mb-5">{t.generatorFrequencyDesc}</p>
            <div className="grid grid-cols-2 gap-3">
              {frequencyOptions.map(opt => {
                const active = weeklyFrequency === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setWeeklyFrequency(opt.value)}
                    className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-200 active:scale-[0.97] cursor-pointer bg-transparent font-inherit ${
                      active
                        ? 'border-strength bg-strength/8'
                        : 'border-border bg-bg-card'
                    }`}
                  >
                    <span className={`text-[28px] font-bold ${active ? 'text-strength' : 'text-text'}`}>
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-text-muted mt-1 uppercase tracking-wide">{t.generatorPerWeek}</span>
                    <span className={`text-[11px] mt-2 ${active ? 'text-strength' : 'text-text-muted'}`}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
            </div>
          )}

          {/* Step 3: Level */}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              {levelOptions.map(opt => {
                const active = level === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setLevel(opt.value)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] cursor-pointer bg-transparent font-inherit text-left ${
                      active
                        ? 'border-strength bg-strength/8'
                        : 'border-border bg-bg-card'
                    }`}
                  >
                    <span className="text-[28px] shrink-0">{opt.icon}</span>
                    <div>
                      <div className={`text-[16px] font-semibold ${active ? 'text-strength' : 'text-text'}`}>
                        {t[opt.labelKey]}
                      </div>
                      <div className="text-[12px] text-text-muted mt-0.5">{opt.desc}</div>
                    </div>
                    {active && (
                      <div className="ml-auto shrink-0 w-5 h-5 rounded-full bg-strength flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 4: Equipment */}
          {step === 4 && (
            <div className="grid grid-cols-2 gap-2.5">
              {EQUIPMENT_OPTIONS.map(eq => {
                const active = equipment.includes(eq);
                const key = EQUIPMENT_KEYS[eq] as keyof typeof t;
                const icon = EQUIPMENT_ICONS[eq];
                return (
                  <button
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 active:scale-[0.97] cursor-pointer bg-transparent font-inherit text-left ${
                      active
                        ? 'border-strength bg-strength/8'
                        : 'border-border bg-bg-card'
                    }`}
                  >
                    <span className="text-[20px]">{icon}</span>
                    <span className={`text-[13px] font-medium ${active ? 'text-strength' : 'text-text'}`}>
                      {t[key] as string}
                    </span>
                    {active && (
                      <div className="ml-auto shrink-0 w-4.5 h-4.5 rounded-full bg-strength flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 5: Summary */}
          {step === 5 && (
            <div className="space-y-4">
              {/* Summary card */}
              <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
                {/* Muscles */}
                <div className="px-4 py-3.5 border-b border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                      <path d="M6 2v6M18 2v6M6 16v6M18 16v6M2 10h4v4H2zM18 10h4v4h-4zM6 11h12" />
                    </svg>
                    <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Muscles</span>
                  </div>
                  <div className="text-[14px] text-text font-medium">
                    {selectedMuscles.map(m => t.muscleGroups[m] || m).join(', ')}
                  </div>
                </div>

                {/* Frequency + Level row */}
                <div className="flex border-b border-border">
                  <div className="flex-1 px-4 py-3.5 border-r border-border">
                    <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold mb-1">{t.generatorFrequencyStep}</div>
                    <div className="text-[15px] text-text font-semibold">{weeklyFrequency === 5 ? '5-6' : weeklyFrequency}x <span className="text-text-muted font-normal text-[12px]">/ {t.generatorPerWeek}</span></div>
                  </div>
                  <div className="flex-1 px-4 py-3.5">
                    <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold mb-1">{t.generatorLevelStep}</div>
                    <div className="text-[15px] text-text font-semibold">
                      {t[`generator${level.charAt(0).toUpperCase() + level.slice(1)}` as keyof typeof t] as string}
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                <div className="px-4 py-3.5">
                  <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold mb-2">{t.generatorEquipmentStep}</div>
                  <div className="text-[14px] text-text font-medium">
                    {equipment.map(eq => {
                      const key = EQUIPMENT_KEYS[eq] as keyof typeof t;
                      return t[key] as string;
                    }).join(', ')}
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3.5 space-y-1">
                  {warnings.map((w, i) => (
                    <p key={i} className="text-orange-400 text-[13px] flex items-start gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 pb-6 pt-2">
          {step < TOTAL_STEPS ? (
            <button
              disabled={!canNext}
              onClick={() => setStep(s => s + 1)}
              className="w-full py-3.5 rounded-xl font-semibold text-[15px] bg-strength text-white disabled:opacity-30 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none font-inherit shadow-[0_4px_16px_rgba(255,138,59,0.2)]"
            >
              {t.generatorNext}
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3.5 rounded-xl font-semibold text-[15px] bg-strength text-white disabled:opacity-50 transition-all duration-200 active:scale-[0.98] cursor-pointer border-none font-inherit shadow-[0_4px_16px_rgba(255,138,59,0.3)] flex items-center justify-center gap-2"
            >
              {generating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M5 12l7-9 7 9M8 21h8" />
                </svg>
              )}
              {generating ? t.loading : t.generatorGenerate}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
