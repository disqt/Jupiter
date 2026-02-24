'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getWorkoutsForMonth, getMonthlyStats, type Workout } from '@/lib/data';

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const weekdays = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export default function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const workouts = getWorkoutsForMonth(year, month);
  const stats = getMonthlyStats(year, month);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const getWorkoutsForDay = (day: number): Workout[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workouts.filter((w) => w.date === dateStr);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const formatDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Auto-select today on load
  useEffect(() => {
    if (month === today.getMonth() && year === today.getFullYear()) {
      setSelectedDate(formatDateStr(today.getDate()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectDay = (day: number) => {
    const dateStr = formatDateStr(day);
    setSelectedDate(dateStr);
    setShowSheet(false);
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  // Parse selected date
  const selectedDay = selectedDate ? parseInt(selectedDate.split('-')[2]) : null;
  const selectedDayWorkouts = selectedDay ? getWorkoutsForDay(selectedDay) : [];
  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;
  const selectedWeekday = selectedDateObj ? weekdays[selectedDateObj.getDay()] : '';
  const isTodaySelected = selectedDay !== null && isToday(selectedDay);

  return (
    <div>
      {/* Header */}
      <div className="app-header">
        <h1 style={{ fontFamily: 'var(--font-instrument-serif), serif' }}>
          Jupiter <span>Tracker</span>
        </h1>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        {/* Month navigation */}
        <div className="month-nav">
          <button className="month-nav-btn" onClick={prevMonth}>&#8249;</button>
          <span className="month-label">{monthNames[month]} {year}</span>
          <button className="month-nav-btn" onClick={nextMonth}>&#8250;</button>
        </div>

        {/* Day headers */}
        <div className="cal-days-header">
          {dayNames.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="cal-grid">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="cal-cell empty" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayWorkouts = getWorkoutsForDay(day);
            const hasVelo = dayWorkouts.some((w) => w.type === 'velo');
            const hasMuscu = dayWorkouts.some((w) => w.type === 'musculation');
            const hasBoth = hasVelo && hasMuscu;
            const dateStr = formatDateStr(day);
            const isTodayCell = isToday(day);
            const isSelected = selectedDate === dateStr;

            let cellClass = 'cal-cell';
            if (isTodayCell) cellClass += ' today';
            if (isSelected) cellClass += ' selected';
            if (dayWorkouts.length > 0) cellClass += ' has-workout';
            if (hasBoth) {
              cellClass += ' has-both';
            } else if (hasVelo) {
              cellClass += ' has-cycling';
            } else if (hasMuscu) {
              cellClass += ' has-strength';
            }

            return (
              <div
                key={day}
                className={cellClass}
                onClick={() => selectDay(day)}
              >
                <span className="day-num">{day}</span>
                {(hasVelo || hasMuscu) && (
                  <div className="cal-tags">
                    {hasVelo && <span className="cal-tag cycling">🚴 Vélo</span>}
                    {hasMuscu && <span className="cal-tag strength">🏋️ Muscu</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Day panel */}
        {selectedDate && (
          <div className="day-panel" ref={panelRef}>
            <div className="day-panel-header">
              <div>
                <div className="day-panel-date">{selectedDay} {monthNames[month]}</div>
                <div className="day-panel-weekday">
                  {selectedWeekday}{isTodaySelected ? " — aujourd'hui" : ''}
                </div>
              </div>
            </div>

            {selectedDayWorkouts.length > 0 ? (
              selectedDayWorkouts.map((w) => (
                <Link
                  key={w.id}
                  href={w.type === 'velo' ? `/workout/cycling?date=${selectedDate}` : `/workout/strength?date=${selectedDate}`}
                  className="day-workout"
                >
                  <div className={`day-workout-icon ${w.type === 'velo' ? 'cycling' : 'strength'}`}>
                    {w.type === 'velo' ? '🚴' : '🏋️'}
                  </div>
                  <div className="day-workout-info">
                    <div className="day-workout-type">
                      {w.type === 'velo' ? 'Vélo' : 'Musculation'}
                    </div>
                    <div className="day-workout-detail">{w.detail}</div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>›</span>
                </Link>
              ))
            ) : (
              <div className="day-empty">Aucune séance</div>
            )}
          </div>
        )}

        {/* Monthly stats */}
        <div className="month-stats">
          <div className="stat-card strength-stat">
            <div className="stat-value">{stats.strengthCount}</div>
            <div className="stat-label">Séances muscu</div>
          </div>
          <div className="stat-card cycling-stat">
            <div className="stat-value">{stats.cyclingCount}</div>
            <div className="stat-label">Séances vélo</div>
          </div>
          <div className="stat-card cycling-stat">
            <div className="stat-value">
              {stats.totalDistanceKm.toLocaleString('fr-FR')} <span className="stat-unit">km</span>
            </div>
            <div className="stat-label">Distance parcourue</div>
          </div>
          <div className="stat-card cycling-stat">
            <div className="stat-value">
              {stats.totalElevationM.toLocaleString('fr-FR')} <span className="stat-unit">m</span>
            </div>
            <div className="stat-label">Dénivelé cumulé</div>
          </div>
        </div>
      </div>

      {/* FAB */}
      {selectedDate && (
        <button className="fab" onClick={() => setShowSheet(true)}>+</button>
      )}

      {/* Bottom sheet */}
      {showSheet && (
        <>
          <div className="sheet-overlay" onClick={() => setShowSheet(false)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <h3 style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: '22px', fontWeight: 400, marginBottom: '20px' }}>
              Nouvelle séance
            </h3>
            <div className="type-choice">
              <Link
                href={`/workout/cycling?date=${selectedDate}`}
                className="type-btn cycling-choice"
                onClick={() => setShowSheet(false)}
              >
                <div className="type-icon">🚴</div>
                <div className="type-label">Vélo</div>
              </Link>
              <Link
                href={`/workout/strength?date=${selectedDate}`}
                className="type-btn strength-choice"
                onClick={() => setShowSheet(false)}
              >
                <div className="type-icon">🏋️</div>
                <div className="type-label">Musculation</div>
              </Link>
            </div>
            <button className="sheet-cancel" onClick={() => setShowSheet(false)}>
              Annuler
            </button>
          </div>
        </>
      )}
    </div>
  );
}
