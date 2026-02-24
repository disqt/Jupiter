'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Workout {
  id: number;
  date: string;
  type: 'musculation' | 'velo';
}

interface MonthlyStats {
  cycling_count: string;
  strength_count: string;
  total_distance_km: string;
  total_elevation_m: string;
  active_days: string;
}

interface CalendarProps {
  onDayClick: (date: string, workouts: Workout[]) => void;
}

export default function Calendar({ onDayClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<MonthlyStats | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  useEffect(() => {
    api.getWorkouts(monthStr).then(setWorkouts).catch(console.error);
    api.getMonthlyStats(monthStr).then(setStats).catch(console.error);
  }, [monthStr]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getWorkoutsForDay = (day: number): Workout[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workouts.filter((w) => w.date === dateStr);
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 text-gray-600 text-lg">&larr;</button>
        <h2 className="text-lg font-semibold">{monthNames[month]} {year}</h2>
        <button onClick={nextMonth} className="p-2 text-gray-600 text-lg">&rarr;</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayWorkouts = getWorkoutsForDay(day);
          const hasVelo = dayWorkouts.some((w) => w.type === 'velo');
          const hasMuscu = dayWorkouts.some((w) => w.type === 'musculation');
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <button
              key={day}
              onClick={() => onDayClick(dateStr, dayWorkouts)}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${dayWorkouts.length > 0 ? 'bg-gray-100' : 'hover:bg-gray-50'}
              `}
            >
              <span className={isToday ? 'font-bold' : ''}>{day}</span>
              {(hasVelo || hasMuscu) && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasVelo && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  {hasMuscu && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Monthly summary */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600">{stats.strength_count}</div>
            <div className="text-xs text-orange-400">Séances muscu</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.cycling_count}</div>
            <div className="text-xs text-blue-400">Séances vélo</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.total_distance_km}</div>
            <div className="text-xs text-blue-400">km parcourus</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.total_elevation_m}</div>
            <div className="text-xs text-blue-400">m de dénivelé</div>
          </div>
        </div>
      )}
    </div>
  );
}
