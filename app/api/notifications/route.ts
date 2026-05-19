import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllSubscribers, getAllEvents, createLog } from '@/lib/db';
import { sendEventEmail } from '@/lib/email';
import { sendWhatsApp } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { eventId } = await req.json();
    const events = (await getAllEvents()) as Record<string, unknown>[];
    const event = events.find((e) => (e.id as number) === eventId);
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const subscribers = (await getAllSubscribers()) as { name: string; email: string; phone: string }[];
    const results = { email: 0, whatsapp: 0, errors: [] as string[] };

    const eventDate = new Date((event.date as string) + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    });

    for (const sub of subscribers) {
      if ((event.emailNotif as boolean) && sub.email) {
        try {
          await sendEventEmail({ to: sub.email, name: sub.name, eventName: event.name as string, eventDate, eventDesc: event.desc as string });
          await createLog({ subscriberName: sub.name, eventName: event.name as string, channel: 'email', status: 'delivered' });
          results.email++;
        } catch (err) {
          await createLog({ subscriberName: sub.name, eventName: event.name as string, channel: 'email', status: 'failed' });
          results.errors.push(`Email to ${sub.name}: ${(err as Error).message}`);
        }
      }
      if ((event.waNotif as boolean) && sub.phone) {
        try {
          await sendWhatsApp({ to: sub.phone, name: sub.name, eventName: event.name as string, eventDate });
          await createLog({ subscriberName: sub.name, eventName: event.name as string, channel: 'whatsapp', status: 'delivered' });
          results.whatsapp++;
        } catch (err) {
          await createLog({ subscriberName: sub.name, eventName: event.name as string, channel: 'whatsapp', status: 'failed' });
          results.errors.push(`WhatsApp to ${sub.name}: ${(err as Error).message}`);
        }
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
