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

  // Load saved prefs on open
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

  const levelOptions: { value: Level; labelKey: 'generatorBeginner' | 'generatorIntermediate' | 'generatorExpert' }[] = [
    { value: 'beginner', labelKey: 'generatorBeginner' },
    { value: 'intermediate', labelKey: 'generatorIntermediate' },
    { value: 'expert', labelKey: 'generatorExpert' },
  ];

  const frequencyOptions: { value: 2 | 3 | 4 | 5; label: string }[] = [
    { value: 2, label: '2x' },
    { value: 3, label: '3x' },
    { value: 4, label: '4x' },
    { value: 5, label: '5-6x' },
  ];

  const dots = (
    <div className="flex justify-center gap-2 py-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i <= step ? 'bg-[#c9a96e]' : 'bg-zinc-600'}`}
        />
      ))}
    </div>
  );

  const nextBtn = (disabled?: boolean) => (
    <button
      disabled={disabled}
      onClick={() => setStep(s => s + 1)}
      className="w-full py-3 rounded-xl font-semibold bg-[#c9a96e] text-black disabled:opacity-40"
    >
      {t.generatorNext}
    </button>
  );

  const backBtn = (
    <button
      onClick={() => setStep(s => s - 1)}
      className="w-full py-3 rounded-xl font-semibold border border-zinc-600 text-zinc-300"
    >
      {t.generatorBack}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-zinc-900 text-white w-full h-full max-w-lg mx-auto flex flex-col lg:h-auto lg:max-h-[90vh] lg:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <button onClick={onClose} className="text-zinc-400 text-2xl leading-none">&times;</button>
          <span className="font-semibold">{t.generatorTitle}</span>
          <div className="w-6" />
        </div>

        {dots}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {step === 1 && (
            <div className="flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-4">{t.generatorMusclesStep}</h2>
              <div className="flex-1 min-h-0">
                <BodyMuscleSelector selected={selectedMuscles} onSelectionChange={setSelectedMuscles} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">{t.generatorFrequencyStep}</h2>
              <div className="flex flex-col gap-3">
                {frequencyOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setWeeklyFrequency(opt.value)}
                    className={`p-4 rounded-xl border text-left font-medium flex items-center justify-between ${
                      weeklyFrequency === opt.value
                        ? 'border-[#c9a96e] bg-[#c9a96e]/10 text-[#c9a96e]'
                        : 'border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <span>{opt.label} {t.generatorPerWeek}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">{t.generatorLevelStep}</h2>
              <div className="flex flex-col gap-3">
                {levelOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setLevel(opt.value)}
                    className={`p-4 rounded-xl border text-left font-medium ${
                      level === opt.value
                        ? 'border-[#c9a96e] bg-[#c9a96e]/10 text-[#c9a96e]'
                        : 'border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {t[opt.labelKey]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">{t.generatorEquipmentStep}</h2>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map(eq => {
                  const active = equipment.includes(eq);
                  const key = EQUIPMENT_KEYS[eq] as keyof typeof t;
                  return (
                    <button
                      key={eq}
                      onClick={() => toggleEquipment(eq)}
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        active ? 'bg-[#c9a96e] text-black' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {t[key] as string}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">{t.generatorSummaryStep}</h2>

              {/* Selected muscles */}
              <div className="mb-4">
                <span className="text-xs text-zinc-400 uppercase tracking-wide">{t.generatorMusclesStep}</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMuscles.map(m => (
                    <span key={m} className="bg-zinc-800 text-zinc-200 rounded-full px-3 py-1 text-sm">
                      {t.muscleGroups[m] || m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="mb-4">
                <span className="text-xs text-zinc-400 uppercase tracking-wide">{t.generatorFrequencyStep}</span>
                <div className="mt-2">
                  <span className="inline-block bg-zinc-800 text-zinc-200 rounded-full px-3 py-1 text-sm">
                    {weeklyFrequency === 5 ? '5-6' : weeklyFrequency}x {t.generatorPerWeek}
                  </span>
                </div>
              </div>

              {/* Level */}
              <div className="mb-4">
                <span className="text-xs text-zinc-400 uppercase tracking-wide">{t.generatorLevelStep}</span>
                <div className="mt-2">
                  <span className="inline-block bg-[#c9a96e]/15 text-[#c9a96e] rounded-full px-3 py-1 text-sm font-medium">
                    {t[`generator${level.charAt(0).toUpperCase() + level.slice(1)}` as keyof typeof t] as string}
                  </span>
                </div>
              </div>

              {/* Equipment */}
              <div className="mb-6">
                <span className="text-xs text-zinc-400 uppercase tracking-wide">{t.generatorEquipmentStep}</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {equipment.map(eq => {
                    const key = EQUIPMENT_KEYS[eq] as keyof typeof t;
                    return (
                      <span key={eq} className="bg-zinc-800 text-zinc-200 rounded-full px-3 py-1 text-sm">
                        {t[key] as string}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="mb-4 space-y-1">
                  {warnings.map((w, i) => (
                    <p key={i} className="text-orange-400 text-sm">{w}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-4 pb-6 space-y-2">
          {step === 1 && nextBtn(selectedMuscles.length === 0)}
          {step === 2 && (
            <>
              {nextBtn()}
              {backBtn}
            </>
          )}
          {step === 3 && (
            <>
              {nextBtn()}
              {backBtn}
            </>
          )}
          {step === 4 && (
            <>
              {nextBtn(equipment.length === 0)}
              {backBtn}
            </>
          )}
          {step === 5 && (
            <>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3 rounded-xl font-semibold bg-[#c9a96e] text-black disabled:opacity-60"
              >
                {generating ? t.loading : t.generatorGenerate}
              </button>
              {backBtn}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
