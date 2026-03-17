'use client';

import { useState, useEffect, useCallback } from 'react';
import { MUSCLE_GROUPS, UPPER_BODY_GROUPS, LOWER_BODY_GROUPS } from '@/lib/data';

interface BodyMuscleSelectorProps {
  selected: string[];
  onSelectionChange: (muscles: string[]) => void;
}

const SPLITS: Record<string, string[]> = {
  'Full body': [...MUSCLE_GROUPS],
  'Haut du corps': [...UPPER_BODY_GROUPS],
  'Bas du corps': [...LOWER_BODY_GROUPS],
  'Push': ['Pectoraux', 'Épaules', 'Triceps', 'Quadriceps'],
  'Pull': ['Dos', 'Biceps', 'Ischios'],
};

// Muscle zone SVG definitions for front view
const FRONT_ZONES: { muscle: string; d: string }[] = [
  // Pectoraux - two chest slabs
  { muscle: 'Pectoraux', d: 'M62,95 Q70,88 80,90 L95,90 Q100,90 100,97 L98,108 Q95,112 88,112 L72,112 Q65,112 62,108 Z M100,90 Q105,88 110,90 L128,90 Q138,90 138,97 L136,108 Q133,112 128,112 L112,108 Q105,112 100,97 Z' },
  // Épaules front - deltoid caps
  { muscle: 'Épaules', d: 'M48,82 Q52,72 62,75 L65,88 Q62,95 55,95 L50,92 Q46,88 48,82 Z M138,75 Q148,72 152,82 L150,92 Q148,95 145,95 L135,95 Q132,92 135,88 Z' },
  // Biceps
  { muscle: 'Biceps', d: 'M42,100 Q45,95 50,96 L54,100 L56,120 Q56,132 52,138 L46,138 Q42,132 42,120 Z M144,96 Q150,95 154,100 L158,120 Q158,132 154,138 L148,138 Q144,132 144,120 Z' },
  // Abdominaux - 6-pack area
  { muscle: 'Abdominaux', d: 'M78,116 Q82,114 88,114 L112,114 Q118,114 122,116 L124,150 Q124,168 118,175 L108,180 Q100,182 92,180 L82,175 Q76,168 76,150 Z' },
  // Quadriceps - front thighs
  { muscle: 'Quadriceps', d: 'M72,185 Q78,180 86,182 L94,185 Q96,190 96,200 L95,240 Q94,252 88,258 L78,258 Q72,252 72,240 Z M106,185 Q112,182 122,180 L128,185 Q130,190 128,200 L128,240 Q128,252 122,258 L112,258 Q106,252 105,240 Z' },
  // Mollets front
  { muscle: 'Mollets', d: 'M76,272 Q80,265 86,266 L90,268 Q92,275 91,290 L90,315 Q88,325 84,328 L80,328 Q76,325 75,315 L74,290 Q74,278 76,272 Z M110,268 Q116,265 122,266 L126,272 Q128,278 126,290 L125,315 Q124,325 120,328 L116,328 Q112,325 110,315 L109,290 Q108,275 110,268 Z' },
];

// Muscle zone SVG definitions for back view
const BACK_ZONES: { muscle: string; d: string }[] = [
  // Dos - upper/mid back
  { muscle: 'Dos', d: 'M65,90 Q72,86 80,88 L92,90 Q100,92 100,98 L100,140 Q100,150 94,155 L80,158 Q72,158 68,150 L65,130 Z M100,90 Q108,86 118,88 L135,90 Q138,92 138,98 L135,130 Q132,150 128,158 L120,158 Q106,155 100,150 L100,98 Z' },
  // Épaules back - rear deltoids
  { muscle: 'Épaules', d: 'M48,82 Q52,72 62,75 L65,88 Q62,95 55,95 L50,92 Q46,88 48,82 Z M138,75 Q148,72 152,82 L150,92 Q148,95 145,95 L135,95 Q132,92 135,88 Z' },
  // Triceps
  { muscle: 'Triceps', d: 'M42,100 Q45,95 50,96 L54,100 L56,120 Q56,132 52,138 L46,138 Q42,132 42,120 Z M144,96 Q150,95 154,100 L158,120 Q158,132 154,138 L148,138 Q144,132 144,120 Z' },
  // Ischios - hamstrings
  { muscle: 'Ischios', d: 'M72,188 Q78,182 88,184 L94,188 Q96,195 95,210 L94,245 Q92,255 86,258 L78,258 Q72,255 72,245 Z M106,188 Q116,182 126,184 L128,188 Q130,195 128,210 L128,245 Q126,255 122,258 L112,258 Q106,255 105,245 Z' },
  // Fessiers - glutes
  { muscle: 'Fessiers', d: 'M72,162 Q78,156 88,158 L100,165 Q100,178 94,184 L82,186 Q74,184 72,178 Z M100,165 Q112,158 122,156 L128,162 Q130,170 128,178 L118,186 Q108,184 100,178 Z' },
  // Mollets back
  { muscle: 'Mollets', d: 'M76,272 Q80,265 86,266 L90,268 Q92,275 91,290 L90,315 Q88,325 84,328 L80,328 Q76,325 75,315 L74,290 Q74,278 76,272 Z M110,268 Q116,265 122,266 L126,272 Q128,278 126,290 L125,315 Q124,325 120,328 L116,328 Q112,325 110,315 L109,290 Q108,275 110,268 Z' },
];

// Body outline paths
const FRONT_OUTLINE = 'M100,12 Q88,12 82,20 Q76,28 76,38 Q76,48 80,55 Q84,62 90,65 Q82,68 72,72 Q58,76 48,82 Q40,88 38,98 L36,115 Q35,125 38,135 L42,148 Q38,148 36,155 Q34,165 36,170 L38,172 Q40,170 42,168 L42,148 Q46,158 52,165 Q54,168 56,172 L58,165 Q60,175 64,180 Q68,185 72,188 L72,245 Q72,258 76,270 L74,290 Q72,310 74,325 L76,338 Q78,348 84,350 L88,348 Q92,346 92,340 L92,335 Q92,325 91,315 L90,290 Q90,270 92,260 L96,260 Q98,262 100,262 Q102,262 104,260 L108,260 Q110,270 110,290 L109,315 Q108,325 108,335 L108,340 Q108,346 112,348 L116,350 Q122,348 124,338 L126,325 Q128,310 126,290 L124,270 Q128,258 128,245 L128,188 Q132,185 136,180 Q140,175 142,165 L144,172 Q148,168 150,165 Q156,158 158,148 L158,168 Q160,170 162,172 L164,170 Q166,165 164,155 Q162,148 158,148 L162,135 Q165,125 164,115 L162,98 Q160,88 152,82 Q142,76 128,72 Q118,68 110,65 Q116,62 120,55 Q124,48 124,38 Q124,28 118,20 Q112,12 100,12 Z';
const BACK_OUTLINE = 'M100,12 Q88,12 82,20 Q76,28 76,38 Q76,48 80,55 Q84,62 90,65 Q82,68 72,72 Q58,76 48,82 Q40,88 38,98 L36,115 Q35,125 38,135 L42,148 Q38,148 36,155 Q34,165 36,170 L38,172 Q40,170 42,168 L42,148 Q46,158 52,165 Q54,168 56,172 L58,165 Q60,175 64,180 Q68,185 72,188 L72,245 Q72,258 76,270 L74,290 Q72,310 74,325 L76,338 Q78,348 84,350 L88,348 Q92,346 92,340 L92,335 Q92,325 91,315 L90,290 Q90,270 92,260 L96,260 Q98,262 100,262 Q102,262 104,260 L108,260 Q110,270 110,290 L109,315 Q108,325 108,335 L108,340 Q108,346 112,348 L116,350 Q122,348 124,338 L126,325 Q128,310 126,290 L124,270 Q128,258 128,245 L128,188 Q132,185 136,180 Q140,175 142,165 L144,172 Q148,168 150,165 Q156,158 158,148 L158,168 Q160,170 162,172 L164,170 Q166,165 164,155 Q162,148 158,148 L162,135 Q165,125 164,115 L162,98 Q160,88 152,82 Q142,76 128,72 Q118,68 110,65 Q116,62 120,55 Q124,48 124,38 Q124,28 118,20 Q112,12 100,12 Z';

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export default function BodyMuscleSelector({ selected, onSelectionChange }: BodyMuscleSelectorProps) {
  const [tooltip, setTooltip] = useState<{ muscle: string; x: number; y: number; view: 'front' | 'back' } | null>(null);

  useEffect(() => {
    if (!tooltip) return;
    const timer = setTimeout(() => setTooltip(null), 2000);
    return () => clearTimeout(timer);
  }, [tooltip]);

  const toggleMuscle = useCallback((muscle: string, e: React.MouseEvent<SVGPathElement>) => {
    const rect = (e.target as SVGPathElement).getBoundingClientRect();
    const svgRect = (e.target as SVGPathElement).closest('svg')!.getBoundingClientRect();
    const view = (e.target as SVGPathElement).closest('[data-view]')?.getAttribute('data-view') as 'front' | 'back';
    setTooltip({
      muscle,
      x: rect.left + rect.width / 2 - svgRect.left,
      y: rect.top - svgRect.top - 8,
      view: view || 'front',
    });

    if (selected.includes(muscle)) {
      onSelectionChange(selected.filter(m => m !== muscle));
    } else {
      onSelectionChange([...selected, muscle]);
    }
  }, [selected, onSelectionChange]);

  const handleSplit = (splitName: string) => {
    const muscles = SPLITS[splitName];
    if (arraysEqual(selected, muscles)) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...muscles]);
    }
  };

  const isSelected = (muscle: string) => selected.includes(muscle);

  const zoneProps = (muscle: string) => ({
    fill: isSelected(muscle) ? '#c9a96e' : '#374151',
    opacity: isSelected(muscle) ? 0.85 : 0.5,
    stroke: isSelected(muscle) ? '#c9a96e' : 'none',
    strokeWidth: isSelected(muscle) ? 1 : 0,
    style: { cursor: 'pointer' as const, filter: isSelected(muscle) ? 'drop-shadow(0 0 4px rgba(201,169,110,0.5))' : 'none' },
    onClick: (e: React.MouseEvent<SVGPathElement>) => toggleMuscle(muscle, e),
  });

  return (
    <div className="w-full">
      {/* Split tags */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
        {Object.keys(SPLITS).map(name => {
          const active = arraysEqual(selected, SPLITS[name]);
          return (
            <button
              key={name}
              onClick={() => handleSplit(name)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active ? 'bg-[#c9a96e] text-black' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Body SVGs */}
      <div className="flex justify-center gap-2 mt-2 relative">
        {/* Front view */}
        <div className="flex flex-col items-center" style={{ width: '45%' }}>
          <div className="relative w-full" data-view="front">
            <svg viewBox="0 0 200 370" className="w-full h-auto" style={{ maxHeight: 300 }}>
              {/* Body outline */}
              <path d={FRONT_OUTLINE} fill="none" stroke="#1f2937" strokeWidth="2" />
              {/* Muscle zones */}
              {FRONT_ZONES.map(({ muscle, d }) => (
                <path key={`front-${muscle}`} d={d} {...zoneProps(muscle)} />
              ))}
              {/* Tooltip */}
              {tooltip && tooltip.view === 'front' && (
                <g>
                  <rect
                    x={tooltip.x - 40}
                    y={tooltip.y - 18}
                    width="80"
                    height="20"
                    rx="6"
                    fill="#c9a96e"
                  />
                  <text
                    x={tooltip.x}
                    y={tooltip.y - 5}
                    textAnchor="middle"
                    fill="black"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {tooltip.muscle}
                  </text>
                </g>
              )}
            </svg>
          </div>
          <span className="text-xs text-zinc-500 mt-1">Face</span>
        </div>

        {/* Back view */}
        <div className="flex flex-col items-center" style={{ width: '45%' }}>
          <div className="relative w-full" data-view="back">
            <svg viewBox="0 0 200 370" className="w-full h-auto" style={{ maxHeight: 300 }}>
              {/* Body outline */}
              <path d={BACK_OUTLINE} fill="none" stroke="#1f2937" strokeWidth="2" />
              {/* Muscle zones */}
              {BACK_ZONES.map(({ muscle, d }) => (
                <path key={`back-${muscle}`} d={d} {...zoneProps(muscle)} />
              ))}
              {/* Tooltip */}
              {tooltip && tooltip.view === 'back' && (
                <g>
                  <rect
                    x={tooltip.x - 40}
                    y={tooltip.y - 18}
                    width="80"
                    height="20"
                    rx="6"
                    fill="#c9a96e"
                  />
                  <text
                    x={tooltip.x}
                    y={tooltip.y - 5}
                    textAnchor="middle"
                    fill="black"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {tooltip.muscle}
                  </text>
                </g>
              )}
            </svg>
          </div>
          <span className="text-xs text-zinc-500 mt-1">Dos</span>
        </div>
      </div>
    </div>
  );
}
