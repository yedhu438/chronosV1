import { NextRequest, NextResponse } from 'next/server';
import { getEventsDueForReminder, markReminderSent, getAllSubscribers, createLog } from '@/lib/db';
import { sendEventEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { sent: 0, errors: [] as string[] };

  for (const daysUntil of [20, 7] as const) {
    const events = (await getEventsDueForReminder(daysUntil)) as Record<string, unknown>[];
    const employees = (await getAllSubscribers()) as { name: string; email: string; phone: string }[];

    for (const event of events) {
      const eventDate = new Date((event.date as string) + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
      });

      for (const emp of employees) {
        if (!emp.email) continue;
        try {
          await sendEventEmail({
            to: emp.email,
            name: emp.name,
            eventName: event.name as string,
            eventDate,
            eventDesc: event.desc as string,
            daysUntil,
          });
          await createLog({
            subscriberName: emp.name,
            eventName: event.name as string,
            channel: 'email',
            status: 'delivered',
          });
          results.sent++;
        } catch (err) {
          await createLog({
            subscriberName: emp.name,
            eventName: event.name as string,
            channel: 'email',
            status: 'failed',
          });
          results.errors.push(`${emp.name} / ${event.name}: ${(err as Error).message}`);
        }
      }

      await markReminderSent(event.id as number, daysUntil);
    }
  }

  return NextResponse.json(results);
}
