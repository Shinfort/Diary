import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Silakan login untuk menambah catatan' }, { status: 401 });
    }

    const { title, content, mood, photos, videos } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Judul dan isi catatan wajib diisi' }, { status: 400 });
    }

    const photosJson = JSON.stringify(Array.isArray(photos) ? photos : []);
    const videosJson = JSON.stringify(Array.isArray(videos) ? videos : []);

    const res = await query(
      `INSERT INTO diary_entries (title, content, mood, photos, videos, user_id)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6)
       RETURNING *`,
      [title, content, mood || 'Happy', photosJson, videosJson, user.id]
    );

    return NextResponse.json({
      message: 'Catatan berhasil disimpan',
      entry: res.rows[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Save entry error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan catatan di database' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const res = await query(`
      SELECT 
        e.id, 
        e.title, 
        e.content, 
        e.mood, 
        COALESCE(e.photos, '[]'::jsonb) as photos, 
        COALESCE(e.videos, '[]'::jsonb) as videos, 
        e.user_id, 
        e.created_at,
        u.name as author_name
      FROM diary_entries e
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
    `);
    return NextResponse.json({ entries: res.rows }, { status: 200 });
  } catch (error) {
    console.error('Fetch entries error:', error);
    return NextResponse.json({ error: 'Gagal memuat catatan' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (user.role === 'admin') {
      await query('DELETE FROM diary_entries WHERE id = $1', [id]);
    } else {
      await query('DELETE FROM diary_entries WHERE id = $1 AND user_id = $2', [id, user.id]);
    }

    return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
