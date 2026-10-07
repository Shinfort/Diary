import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await verifyAuth();
    const res = await query('SELECT * FROM diary_profile LIMIT 1');
    return NextResponse.json({ 
      profile: res.rows[0],
      isAdmin: userId !== null
    }, { status: 200 });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await verifyAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, pronouns, farm, status, avatar_url } = await req.json();

    const res = await query(
      `UPDATE diary_profile 
       SET name = $1, pronouns = $2, farm = $3, status = $4, avatar_url = $5 
       WHERE id = (SELECT id FROM diary_profile LIMIT 1) 
       RETURNING *`,
      [name, pronouns, farm, status, avatar_url]
    );

    return NextResponse.json({ profile: res.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
