import { getAllEvents } from '@/lib/db';
import { ChronosEvent } from '@/types';
import { Navbar } from '@/components/Navbar';
import { EventCard } from '@/components/EventCard';

function dfn(s: string) {
  const t = new Date(s + 'T00:00:00');
  const n = new Date(); n.setHours(0, 0, 0, 0);
  return Math.ceil((t.getTime() - n.getTime()) / 86400000);
}

export default async function HomePage() {
  const events = (await getAllEvents()) as unknown as ChronosEvent[];
  const upcoming = events.filter(e => dfn(e.date) >= 0);
  const sorted = [...upcoming].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      <Navbar />
      <div className="ch-hero">
        <div className="ch-hero-overlay" />
        <div className="ch-hero-content">
          <div className="ch-hero-eyebrow">Event Intelligence Platform</div>
          <div className="ch-hero-title">FullyMerched Chro<em>nos</em></div>
          <div className="ch-hero-sub">Automated reminders · Real-time countdowns · Smart scheduling</div>
          <div className="ch-hero-stats">
            {[['Events', events.length], ['Upcoming', upcoming.length], ['Categories', 5], ['Year', new Date().getFullYear()]].map(([l, v]) => (
              <div key={String(l)} className="ch-stat">
                <div className="ch-stat-n">{v}</div>
                <div className="ch-stat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="ch-scroll-hint">
          <div className="ch-scroll-line" />
          <span>Scroll</span>
        </div>
      </div>
      <div className="ch-section-divider" />
      <div className="ch-section">
        <div className="ch-section-eyebrow">Live feed</div>
        <div className="ch-section-title">Upcoming<br /><em>Events</em></div>
        <div className="ch-cards-row">
          {sorted.map((ev, i) => <EventCard key={ev.id} ev={ev} idx={i} />)}
        </div>
      </div>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, fontWeight: 900, color: 'rgba(255,255,255,0.15)', fontStyle: 'italic' }}>FullyMerched Chronos</div>
        <div style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', fontFamily: 'Space Mono,monospace' }}>Event Intelligence Platform</div>
      </footer>
    </>
  );
}
