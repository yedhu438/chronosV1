'use client';
import { useState, useEffect } from 'react';

function pad(n: number) { return String(Math.max(0, n)).padStart(2, '0'); }

function getCountdown(date: string, time: string) {
  const diff = new Date(`${date}T${time || '09:00'}:00`).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

export function Countdown({ date, time }: { date: string; time: string }) {
  const [cd, setCd] = useState(() => getCountdown(date, time));

  useEffect(() => {
    const iv = setInterval(() => setCd(getCountdown(date, time)), 1000);
    return () => clearInterval(iv);
  }, [date, time]);

  if (!cd) return (
    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', letterSpacing: 2, fontFamily: 'Space Mono,monospace', textTransform: 'uppercase', marginBottom: 16 }}>
      Event concluded
    </div>
  );

  return (
    <div className="ch-countdown">
      {([['d', 'Days'], ['h', 'Hrs'], ['m', 'Min'], ['s', 'Sec']] as const).map(([k, l]) => (
        <div key={k} className="ch-cd-unit">
          <div className="ch-cd-n">{pad(cd[k as keyof typeof cd])}</div>
          <div className="ch-cd-l">{l}</div>
        </div>
      ))}
    </div>
  );
}
