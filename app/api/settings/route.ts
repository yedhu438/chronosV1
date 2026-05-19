import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSetting, setSetting } from '@/lib/db';

export async function GET() {
  const calendarEditEnabled = (await getSetting('calendarEditEnabled')) === 'true';
  return NextResponse.json({ calendarEditEnabled });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { calendarEditEnabled } = await req.json();
  await setSetting('calendarEditEnabled', calendarEditEnabled ? 'true' : 'false');
  return NextResponse.json({ calendarEditEnabled });
}
