import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    }, { status: 200 });
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}
