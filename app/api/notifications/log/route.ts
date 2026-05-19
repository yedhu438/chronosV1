import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllLogs } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const logs = await getAllLogs();
    return NextResponse.json(logs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
