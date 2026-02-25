'use client';

import { useState, useEffect } from 'react';

interface Props {
  className?: string;
  label?: string;
}

export default function AuthIllustration({ className = '', label = 'SESSIONS' }: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const R = 72;
  const C = Math.round(2 * Math.PI * R); // ~452
  const offset = Math.round(C * 0.3); // 30% remaining = 70% filled

  return (
    <svg viewBox="0 0 320 260" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="auth-ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#7c5ce0" />
        </linearGradient>
        <radialGradient id="auth-glow" cx=".5" cy=".42" r=".35">
          <stop stopColor="#a78bfa" stopOpacity=".07" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow */}
      <circle cx="160" cy="110" r="130" fill="url(#auth-glow)" />

      {/* Ring track */}
      <circle cx="160" cy="110" r={R} stroke="#a78bfa" strokeWidth="5" opacity=".07" />

      {/* Ring fill (animated) */}
      <circle
        cx="160" cy="110" r={R}
        stroke="url(#auth-ring-grad)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={ready ? offset : C}
        transform="rotate(-90 160 110)"
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1) .3s' }}
      />

      {/* Center count */}
      <text
        x="160" y="105" textAnchor="middle"
        fill="#f0eff4" fontSize="36" fontWeight="600"
        className="font-sans"
        style={{ opacity: ready ? 1 : 0, transition: 'opacity .5s ease .6s' }}
      >
        3
      </text>
      <text
        x="160" y="130" textAnchor="middle"
        fill="#8b8a94" fontSize="9.5" fontWeight="500"
        className="font-sans"
        style={{ letterSpacing: '1.5px', opacity: ready ? 1 : 0, transition: 'opacity .5s ease .7s' }}
      >
        {label}
      </text>

      {/* Week dots (3 of 7 filled) */}
      {Array.from({ length: 7 }, (_, i) => {
        const x = 97 + i * 21;
        const active = i < 3;
        const fill = active ? (i === 1 ? '#e2a93b' : '#a78bfa') : 'none';
        return (
          <circle
            key={i}
            cx={x} cy="210" r="5"
            fill={fill}
            stroke={active ? 'none' : '#2a2b32'}
            strokeWidth="1.2"
            style={{
              opacity: ready ? (active ? .85 : 1) : 0,
              transition: `opacity .3s ease ${.9 + i * .06}s`,
            }}
          />
        );
      })}

      {/* Dumbbell (left) */}
      <g
        className="auth-float"
        style={{ opacity: ready ? .45 : 0, transition: 'opacity .6s ease .5s' }}
      >
        <rect x="52" y="72" width="7" height="13" rx="2" fill="#a78bfa" />
        <rect x="59" y="75" width="12" height="7" rx="1.5" fill="#a78bfa" opacity=".55" />
        <rect x="71" y="72" width="7" height="13" rx="2" fill="#a78bfa" />
      </g>

      {/* Bicycle (right) */}
      <g
        className="auth-float-delayed"
        style={{ opacity: ready ? .4 : 0, transition: 'opacity .6s ease .7s' }}
      >
        <circle cx="252" cy="84" r="9" stroke="#e2a93b" strokeWidth="1.3" fill="none" />
        <circle cx="274" cy="84" r="9" stroke="#e2a93b" strokeWidth="1.3" fill="none" />
        <path d="M252 84 L263 70 L274 84" stroke="#e2a93b" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      </g>

      {/* Accent dots */}
      <circle cx="88" cy="46" r="1.5" fill="#a78bfa" opacity=".14" />
      <circle cx="232" cy="38" r="1.5" fill="#e2a93b" opacity=".16" />
      <circle cx="278" cy="140" r="1.5" fill="#a78bfa" opacity=".1" />
      <circle cx="42" cy="145" r="1.5" fill="#e2a93b" opacity=".12" />
    </svg>
  );
}
