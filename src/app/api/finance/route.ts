import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get('type');
    const monthFilter = searchParams.get('month'); // format YYYY-MM

    let sql = 'SELECT * FROM financial_records WHERE 1=1';
    const params: any[] = [];

    // Filter by user if logged in, or show all if admin/demo
    if (user && user.role !== 'admin') {
      params.push(user.id);
      sql += ` AND user_id = $${params.length}`;
    }

    if (typeFilter && (typeFilter === 'income' || typeFilter === 'expense')) {
      params.push(typeFilter);
      sql += ` AND type = $${params.length}`;
    }

    if (monthFilter) {
      params.push(`${monthFilter}%`);
      sql += ` AND TO_CHAR(date, 'YYYY-MM') LIKE $${params.length}`;
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    const recordsRes = await query(sql, params);
    const records = recordsRes.rows;

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;

    for (const item of records) {
      const amt = parseFloat(item.amount) || 0;
      if (item.type === 'income') {
        totalIncome += amt;
      } else if (item.type === 'expense') {
        totalExpense += amt;
      }
    }

    const balance = totalIncome - totalExpense;

    return NextResponse.json({
      records,
      summary: {
        totalIncome,
        totalExpense,
        balance,
        count: records.length,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Fetch finances error:', error);
    return NextResponse.json({ error: 'Gagal memuat catatan keuangan' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu' }, { status: 401 });
    }

    const { type, amount, category, description, date } = await req.json();

    if (!type || !amount || !category) {
      return NextResponse.json({ error: 'Tipe, nominal, dan kategori wajib diisi' }, { status: 400 });
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json({ error: 'Tipe harus pemasukan (income) atau pengeluaran (expense)' }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Nominal harus lebih dari 0' }, { status: 400 });
    }

    const recordDate = date || new Date().toISOString().split('T')[0];

    const insertRes = await query(
      `INSERT INTO financial_records (user_id, type, amount, category, description, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user.id, type, numericAmount, category, description || '', recordDate]
    );

    return NextResponse.json({
      message: 'Catatan keuangan berhasil disimpan',
      record: insertRes.rows[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Save finance record error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan catatan keuangan' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID catatan diperlukan' }, { status: 400 });
    }

    // Admins can delete any, standard users only their own
    if (user.role === 'admin') {
      await query('DELETE FROM financial_records WHERE id = $1', [id]);
    } else {
      await query('DELETE FROM financial_records WHERE id = $1 AND user_id = $2', [id, user.id]);
    }

    return NextResponse.json({ message: 'Catatan keuangan berhasil dihapus' }, { status: 200 });
  } catch (error) {
    console.error('Delete finance record error:', error);
    return NextResponse.json({ error: 'Gagal menghapus catatan keuangan' }, { status: 500 });
  }
}
