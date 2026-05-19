import { ChronosEvent, CATS } from '@/types';
import { Countdown } from './Countdown';

function dfn(s: string) {
  const t = new Date(s + 'T00:00:00');
  const n = new Date();
  n.setHours(0, 0, 0, 0);
  return Math.ceil((t.getTime() - n.getTime()) / 86400000);
}

function fmtDate(s: string) {
  return new Date(s + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function EventCard({ ev, idx }: { ev: ChronosEvent; idx: number }) {
  const days = dfn(ev.date);
  const cat = CATS[ev.category] || CATS.launch;

  const badge = days < 0
    ? <span className="ch-days-pill passed">Passed</span>
    : days === 0
    ? <span className="ch-days-pill today">Today</span>
    : <span className="ch-days-pill">{days}d</span>;

  return (
    <div className="ch-ev-card">
      <div
        className="ch-ev-card-bg"
        style={{ background: `linear-gradient(135deg, ${cat.c}18 0%, #0d0d0d 60%)` }}
      />
      <div className="ch-ev-card-overlay" />
      <div className="ch-ev-card-num">{String(idx + 1).padStart(2, '0')}</div>
      <span className="ch-ev-card-cat" style={{ color: cat.c, borderColor: `${cat.c}44` }}>
        {cat.l}
      </span>
      <div className="ch-ev-card-body">
        <div className="ch-ev-card-name">{ev.name}</div>
        <div className="ch-ev-card-date">{fmtDate(ev.date)} · {ev.time}</div>
        <div className="ch-ev-card-desc">{ev.desc}</div>
        <Countdown date={ev.date} time={ev.time} />
        <div className="ch-ev-card-arrow">
          {badge}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {ev.emailNotif && <span style={{ fontSize: 9, letterSpacing: 1, color: 'rgba(200,151,58,0.5)', fontFamily: 'Space Mono,monospace' }}>✉</span>}
            {ev.waNotif && <span style={{ fontSize: 9, letterSpacing: 1, color: 'rgba(200,151,58,0.5)', fontFamily: 'Space Mono,monospace' }}>💬</span>}
            <div className="ch-arrow-btn">→</div>
          </div>
        </div>
      </div>
    </div>
  );
}
