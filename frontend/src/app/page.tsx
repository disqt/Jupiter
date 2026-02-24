'use client';

import { useState } from 'react';
import Calendar from '@/components/Calendar';

interface Workout {
  id: number;
  date: string;
  type: 'musculation' | 'velo';
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);
  const [showTypeChoice, setShowTypeChoice] = useState(false);

  const handleDayClick = (date: string, workouts: Workout[]) => {
    setSelectedDate(date);
    setSelectedWorkouts(workouts);
    setShowTypeChoice(false);
  };

  return (
    <div>
      <Calendar onDayClick={handleDayClick} />

      {/* Selected day panel */}
      {selectedDate && (
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-2">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </h3>
            {selectedWorkouts.length === 0 && !showTypeChoice && (
              <p className="text-gray-400 text-sm">Aucune séance</p>
            )}
            {selectedWorkouts.map((w) => (
              <div key={w.id} className="flex items-center gap-2 py-1">
                <div className={`w-2 h-2 rounded-full ${w.type === 'velo' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                <span className="text-sm">{w.type === 'velo' ? 'Vélo' : 'Musculation'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating + button */}
      {selectedDate && !showTypeChoice && (
        <button
          onClick={() => setShowTypeChoice(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg text-2xl flex items-center justify-center"
        >
          +
        </button>
      )}

      {/* Type choice modal */}
      {showTypeChoice && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6 pb-8">
            <h3 className="text-lg font-semibold mb-4">Nouvelle séance</h3>
            <div className="flex gap-3">
              <a
                href={`/workout/cycling?date=${selectedDate}`}
                className="flex-1 bg-blue-50 text-blue-700 rounded-xl p-4 text-center font-medium"
              >
                Vélo
              </a>
              <a
                href={`/workout/strength?date=${selectedDate}`}
                className="flex-1 bg-orange-50 text-orange-700 rounded-xl p-4 text-center font-medium"
              >
                Musculation
              </a>
            </div>
            <button
              onClick={() => setShowTypeChoice(false)}
              className="w-full mt-3 py-2 text-gray-400 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
