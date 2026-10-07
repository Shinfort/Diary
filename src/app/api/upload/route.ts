import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const userId = await verifyAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, fileBase64 } = await req.json();

    if (!filename || !fileBase64) {
      return NextResponse.json({ error: 'Filename and base64 file data are required' }, { status: 400 });
    }

    // Extract base64 data safely
    const base64Data = fileBase64.includes(';base64,') 
      ? fileBase64.split(';base64,').pop() 
      : fileBase64;

    // Secure the filename
    const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeFilename);
    await fs.writeFile(filePath, base64Data, 'base64');

    return NextResponse.json({ url: `/uploads/${safeFilename}` }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error during upload' }, { status: 500 });
  }
}
