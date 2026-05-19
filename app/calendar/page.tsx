'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ChronosEvent, CATS } from '@/types';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WD = ['S','M','T','W','T','F','S'];

export default function CalendarPage() {
  const [events, setEvents] = useState<ChronosEvent[]>([]);
  const [calendarEditEnabled, setCalendarEditEnabled] = useState(false);
  const router = useRouter();
  const now = new Date();
  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());
  const [sel, setSel] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(setEvents);
    fetch('/api/settings').then(r => r.json()).then(d => setCalendarEditEnabled(d.calendarEditEnabled));
  }, []);

  function chMo(d: number) {
    let m = mo + d, y = yr;
    if (m > 11) { m = 0; y++; }
    else if (m < 0) { m = 11; y--; }
    setMo(m); setYr(y); setSel(null);
  }

  // Build event-by-day map for current month
  const ebd: Record<number, ChronosEvent[]> = {};
  events.forEach(ev => {
    const d = new Date(ev.date + 'T00:00:00');
    if (d.getFullYear() === yr && d.getMonth() === mo) {
      const k = d.getDate();
      if (!ebd[k]) ebd[k] = [];
      ebd[k].push(ev);
    }
  });

  // Build calendar cells
  const cells: { day: number; cur: boolean }[] = [];
  const sd = new Date(yr, mo, 1).getDay();
  const ld = new Date(yr, mo + 1, 0).getDate();
  const pl = new Date(yr, mo, 0).getDate();
  for (let i = sd - 1; i >= 0; i--) cells.push({ day: pl - i, cur: false });
  for (let d = 1; d <= ld; d++) cells.push({ day: d, cur: true });
  const rem = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= rem; d++) cells.push({ day: d, cur: false });

  const selEvs = sel ? (ebd[sel] || []) : [];
  const selStr = sel
    ? new Date(yr, mo, sel).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <>
      <Navbar />
      <div className="ch-section" style={{ paddingTop: '10rem' }}>
        <div className="ch-section-eyebrow">Schedule view</div>
        <div className="ch-section-title">Event<br /><em>Calendar</em></div>
        <div className="ch-cal-wrap">
          {/* Grid */}
          <div className="ch-cal-grid-box">
            <div className="ch-cal-header">
              <span className="ch-cal-month-label">{MONTHS[mo]} {yr}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="ch-cal-nav-btn" onClick={() => chMo(-1)}>‹</button>
                <button className="ch-cal-nav-btn" onClick={() => chMo(1)}>›</button>
              </div>
            </div>
            <div className="ch-cal-day-labels">
              {WD.map((d, i) => <div key={i} className="ch-cal-day-lbl">{d}</div>)}
            </div>
            <div className="ch-cal-cells">
              {cells.map((c, i) => {
                const isToday = c.cur && now.getFullYear() === yr && now.getMonth() === mo && now.getDate() === c.day;
                const isSel = c.cur && sel === c.day;
                const dots = c.cur && ebd[c.day];
                return (
                  <div
                    key={i}
                    className={`ch-cal-cell${!c.cur ? ' other' : ''}${isToday ? ' today' : ''}${isSel ? ' selected' : ''}`}
                    onClick={() => c.cur && setSel(c.day)}
                  >
                    {c.day}
                    {dots && (
                      <div className="ch-cal-dots">
                        {dots.map((ev, j) => (
                          <div key={j} className="ch-cal-dot" style={{ background: CATS[ev.category]?.c || '#c8973a' }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drawer */}
          <div className="ch-cal-drawer">
            {!sel ? (
              <div className="ch-drawer-empty">Select a date<br />to view events</div>
            ) : (
              <>
                <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(200,151,58,0.6)', textTransform: 'uppercase', fontFamily: 'Space Mono,monospace', marginBottom: 20 }}>
                  {selStr}
                </div>
                {selEvs.length === 0 ? (
                  <div className="ch-drawer-empty">No events<br />this day</div>
                ) : (
                  selEvs.map(ev => (
                    <div key={ev.id} style={{ borderLeft: `2px solid ${CATS[ev.category]?.c || '#c8973a'}`, paddingLeft: 16, marginBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4, fontStyle: 'italic' }}>{ev.name}</div>
                        {calendarEditEnabled && (
                          <button
                            onClick={() => router.push(`/admin?edit=${ev.id}`)}
                            style={{ flexShrink: 0, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Space Mono,monospace', color: 'rgba(200,151,58,0.7)', border: '1px solid rgba(200,151,58,0.2)', background: 'transparent', padding: '4px 10px', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(200,151,58,0.6)', fontFamily: 'Space Mono,monospace', marginBottom: 8 }}>⊙ {ev.time}</div>
                      <div style={{ fontSize: 13, color: 'rgba(232,224,208,0.4)', lineHeight: 1.5 }}>{ev.desc}</div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
