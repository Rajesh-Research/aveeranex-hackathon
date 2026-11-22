import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, toPublicUser } from '@/lib/auth';
import { rejectCertificate, getUserById } from '@/lib/db';

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
    const { userId, reason } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const targetUser = getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'Participant not found.' }, { status: 404 });
    }

    const updatedUser = rejectCertificate(userId, reason);
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update certificate status.' }, { status: 500 });
    }

    return NextResponse.json({
      message: `Certificate request rejected for ${updatedUser.name}.`,
      user: toPublicUser(updatedUser),
    });
  } catch (error) {
    console.error('Reject certificate error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
