import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, toPublicUser } from '@/lib/auth';
import { updateUser, getAllUsers } from '@/lib/db';
import { sendProjectSubmissionAlert } from '@/lib/notifications';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const caller = await getAuthUserFromRequest(request);
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const assignedEvent = (formData.get('assignedEvent') as string) || caller.assignedEvent || 'Aveeranex Innovate Nov 2026';
    const githubUrl = (formData.get('githubUrl') as string) || '';
    const notes = (formData.get('notes') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'Please choose a submission file (PDF or PPT, max 10 MB).' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).` },
        { status: 400 }
      );
    }

    const fileExt = path.extname(file.name).toLowerCase();
    const validExtensions = ['.pdf', '.ppt', '.pptx'];
    if (!validExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: 'Only PDF or PPT/PPTX presentations under 10 MB are accepted for project evaluation.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let submissionFileUrl = '';
    const sanitizedBase = path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${caller.id.slice(0, 8)}_${sanitizedBase}_${Date.now()}${fileExt}`;

    // Save locally if filesystem is writable; on serverless Vercel store Base64 Data URL in Postgres
    try {
      if (process.env.VERCEL) {
        throw new Error('Serverless read-only FS');
      }
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, uniqueFileName), buffer);
      submissionFileUrl = `/uploads/${uniqueFileName}`;
    } catch {
      const mimeType =
        fileExt === '.pdf'
          ? 'application/pdf'
          : fileExt === '.pptx'
          ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          : 'application/vnd.ms-powerpoint';
      submissionFileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }
    const fileSizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${(file.size / 1024).toFixed(1)} KB`;

    // Update user in DB
    const updated = await updateUser(caller.id, {
      assignedEvent,
      submissionFileUrl,
      submissionFileName: file.name,
      submissionFileSize: fileSizeStr,
      submissionFileType: fileExt.slice(1).toUpperCase(),
      submissionGithubUrl: githubUrl,
      submissionNotes: notes,
      submittedAt: new Date().toISOString(),
      certificateStatus: caller.certificateStatus === 'APPROVED' ? 'APPROVED' : 'PENDING_APPROVAL',
    });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update submission record.' }, { status: 500 });
    }

    // Determine target host admin emails for this event
    const allUsers = await getAllUsers();
    const hostAdmins = allUsers
      .filter((u) => (u.role === 'admin' || u.category === 'ADMIN') && u.email)
      .map((u) => u.email);

    // Send email alert to event hosts
    await sendProjectSubmissionAlert(
      updated,
      hostAdmins,
      assignedEvent,
      file.name,
      fileSizeStr,
      githubUrl,
      notes
    ).catch((err) => console.error('Error sending project submission email:', err));

    return NextResponse.json({
      message: 'Project presentation submitted successfully! Event hosts have been notified for evaluation.',
      user: toPublicUser(updated),
    });
  } catch (error: any) {
    console.error('Submission upload error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
