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

    const photosArr = Array.isArray(photos) ? photos : [];
    const videosArr = Array.isArray(videos) ? videos : [];

    // Calculate media payload size in bytes
    let mediaSizeBytes = Buffer.byteLength(title, 'utf8') + Buffer.byteLength(content, 'utf8');
    for (const p of photosArr) {
      if (typeof p === 'string') mediaSizeBytes += Buffer.byteLength(p, 'utf8');
    }
    for (const v of videosArr) {
      if (typeof v === 'string') mediaSizeBytes += Buffer.byteLength(v, 'utf8');
    }

    const storageLimit = user.storage_limit_bytes || 5368709120; // 5 GB
    const storageUsed = user.storage_used_bytes || 0;

    if (storageUsed + mediaSizeBytes > storageLimit) {
      return NextResponse.json({
        error: 'Kapasitas penyimpanan 5.0 GB Anda telah penuh. Silakan hapus beberapa catatan atau foto/video lama untuk mengosongkan ruang.',
        storageFull: true,
      }, { status: 400 });
    }

    const photosJson = JSON.stringify(photosArr);
    const videosJson = JSON.stringify(videosArr);

    const res = await query(
      `INSERT INTO diary_entries (title, content, mood, photos, videos, media_size_bytes, user_id)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7)
       RETURNING *`,
      [title, content, mood || 'Happy', photosJson, videosJson, mediaSizeBytes, user.id]
    );

    // Update user storage used
    await query(
      `UPDATE users 
       SET storage_used_bytes = COALESCE(storage_used_bytes, 0) + $1 
       WHERE id = $2`,
      [mediaSizeBytes, user.id]
    );

    return NextResponse.json({
      message: 'Catatan berhasil disimpan',
      entry: res.rows[0],
      storageUsed: storageUsed + mediaSizeBytes,
      storageLimit,
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
        COALESCE(e.media_size_bytes, 0) as media_size_bytes,
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

    // Get entry size and owner before delete
    const entryRes = await query('SELECT media_size_bytes, user_id FROM diary_entries WHERE id = $1', [id]);
    if (entryRes.rowCount && entryRes.rowCount > 0) {
      const entry = entryRes.rows[0];
      const sizeBytes = parseInt(entry.media_size_bytes, 10) || 0;
      const ownerId = entry.user_id;

      if (user.role === 'admin') {
        await query('DELETE FROM diary_entries WHERE id = $1', [id]);
        if (ownerId && sizeBytes > 0) {
          await query('UPDATE users SET storage_used_bytes = GREATEST(0, storage_used_bytes - $1) WHERE id = $2', [sizeBytes, ownerId]);
        }
      } else {
        await query('DELETE FROM diary_entries WHERE id = $1 AND user_id = $2', [id, user.id]);
        if (sizeBytes > 0) {
          await query('UPDATE users SET storage_used_bytes = GREATEST(0, storage_used_bytes - $1) WHERE id = $2', [sizeBytes, user.id]);
        }
      }
    }

    return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Silakan login untuk mengedit catatan' }, { status: 401 });
    }

    const { id, title, content, mood, photos, videos } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID catatan wajib disertakan' }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Judul dan isi catatan wajib diisi' }, { status: 400 });
    }

    // Check entry existence and ownership
    const entryRes = await query('SELECT * FROM diary_entries WHERE id = $1', [id]);
    if (!entryRes.rowCount || entryRes.rowCount === 0) {
      return NextResponse.json({ error: 'Catatan tidak ditemukan' }, { status: 404 });
    }

    const existingEntry = entryRes.rows[0];
    const isOwner = Number(existingEntry.user_id) === Number(user.id);
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Anda tidak memiliki izin untuk mengedit catatan ini' }, { status: 403 });
    }

    const photosArr = Array.isArray(photos) ? photos : [];
    const videosArr = Array.isArray(videos) ? videos : [];

    // Calculate new media payload size in bytes
    let newMediaSizeBytes = Buffer.byteLength(title, 'utf8') + Buffer.byteLength(content, 'utf8');
    for (const p of photosArr) {
      if (typeof p === 'string') newMediaSizeBytes += Buffer.byteLength(p, 'utf8');
    }
    for (const v of videosArr) {
      if (typeof v === 'string') newMediaSizeBytes += Buffer.byteLength(v, 'utf8');
    }

    const oldMediaSizeBytes = parseInt(existingEntry.media_size_bytes, 10) || 0;
    const sizeDiff = newMediaSizeBytes - oldMediaSizeBytes;

    const storageLimit = user.storage_limit_bytes || 5368709120; // 5 GB
    const storageUsed = user.storage_used_bytes || 0;

    if (sizeDiff > 0 && (storageUsed + sizeDiff > storageLimit)) {
      return NextResponse.json({
        error: 'Kapasitas penyimpanan 5.0 GB Anda telah penuh. Tidak dapat menambah ukuran lampiran media.',
        storageFull: true,
      }, { status: 400 });
    }

    const photosJson = JSON.stringify(photosArr);
    const videosJson = JSON.stringify(videosArr);

    const updateRes = await query(
      `UPDATE diary_entries 
       SET title = $1, content = $2, mood = $3, photos = $4::jsonb, videos = $5::jsonb, media_size_bytes = $6
       WHERE id = $7
       RETURNING *`,
      [title, content, mood || 'Happy', photosJson, videosJson, newMediaSizeBytes, id]
    );

    // Update user storage
    const ownerId = existingEntry.user_id;
    if (ownerId && sizeDiff !== 0) {
      await query(
        `UPDATE users 
         SET storage_used_bytes = GREATEST(0, COALESCE(storage_used_bytes, 0) + $1)
         WHERE id = $2`,
        [sizeDiff, ownerId]
      );
    }

    return NextResponse.json({
      message: 'Catatan berhasil diperbarui',
      entry: updateRes.rows[0],
    }, { status: 200 });
  } catch (error) {
    console.error('Update entry error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui catatan di database' }, { status: 500 });
  }
}

