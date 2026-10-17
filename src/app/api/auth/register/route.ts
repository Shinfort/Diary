import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Pendaftaran akun publik telah dinonaktifkan. Website ini bersifat pribadi untuk pemilik catatan.' },
    { status: 403 }
  );
}
