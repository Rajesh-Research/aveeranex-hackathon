import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { filename, base64 } = await req.json();
    if (!filename || !base64) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // 1. Save to public/previews for client-side web downloads
    const publicDir = path.join(process.cwd(), 'public', 'previews');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const publicFilePath = path.join(publicDir, filename);
    fs.writeFileSync(publicFilePath, buffer);

    // 2. Save directly to Artifact directory for conversation embedding
    const artifactDir = 'C:\\Users\\Rajkumar-SOB\\.gemini\\antigravity\\brain\\a5167f71-4b7b-41a5-aba6-e49aefa6c226';
    if (fs.existsSync(artifactDir)) {
      const artifactFilePath = path.join(artifactDir, filename);
      fs.writeFileSync(artifactFilePath, buffer);
    }

    return NextResponse.json({ success: true, filename });
  } catch (err: any) {
    console.error('Error in export-previews:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
