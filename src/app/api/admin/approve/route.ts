import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, toPublicUser } from '@/lib/auth';
import { approveCertificate, getUserById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const caller = getAuthUserFromRequest(request);
    if (!caller || caller.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Super Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const targetUser = getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'Participant not found.' }, { status: 404 });
    }

    const updatedUser = approveCertificate(userId, caller.name);
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to approve certificate.' }, { status: 500 });
    }

    return NextResponse.json({
      message: `Certificate approved successfully for ${updatedUser.name}!`,
      user: toPublicUser(updatedUser),
    });
  } catch (error) {
    console.error('Approve certificate error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
