import { getAllEvents } from '@/lib/db';
import { ChronosEvent } from '@/types';
import { Navbar } from '@/components/Navbar';
import { EventCard } from '@/components/EventCard';

export default async function EventsPage() {
  const events = (await getAllEvents()) as unknown as ChronosEvent[];
  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      <Navbar />
      <div className="ch-section" style={{ paddingTop: '10rem' }}>
        <div className="ch-section-eyebrow">All events</div>
        <div className="ch-section-title">Event<br /><em>Roster</em></div>
        <div className="ch-cards-row">
          {sorted.map((ev, i) => <EventCard key={ev.id} ev={ev} idx={i} />)}
        </div>
      </div>
    </>
  );
}
