import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllEvents, createEvent } from '@/lib/db';

export async function GET() {
  try {
    const events = await getAllEvents();
    return NextResponse.json(events);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const event = await createEvent(body);
    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
