import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, toPublicUser } from '@/lib/auth';
import { rejectCertificate, getUserById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const caller = await getAuthUserFromRequest(request);
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const isSuperAdmin = caller.role === 'super_admin' || caller.email.toLowerCase() === 'info@aveeranex.com';
    const isAuthorizedAdmin = caller.role === 'admin' && Boolean(caller.canApproveCertificates);

    if (!isSuperAdmin && !isAuthorizedAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have certificate management privileges.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, reason } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const targetUser = await getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'Participant not found.' }, { status: 404 });
    }

    const updatedUser = await rejectCertificate(userId, reason);
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
