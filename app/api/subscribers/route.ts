import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllSubscribers, createSubscriber } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const subs = await getAllSubscribers();
    return NextResponse.json(subs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    await createSubscriber(body);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add subscriber' }, { status: 500 });
  }
}
