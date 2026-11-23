import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, toPublicUser } from '@/lib/auth';
import { updateUser, getUserById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const caller = await getAuthUserFromRequest(request);
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const isSuperAdmin = caller.role === 'super_admin' || caller.email.toLowerCase() === 'info@aveeranex.com';
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Only Super Admin can grant or revoke admin certificate rights.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { adminId, canApproveCertificates } = body;

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required.' }, { status: 400 });
    }

    const targetUser = await getUserById(adminId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const updated = await updateUser(adminId, {
      canApproveCertificates: Boolean(canApproveCertificates),
      role: 'admin',
    });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update admin rights.' }, { status: 500 });
    }

    return NextResponse.json({
      message: `Admin approval rights successfully ${canApproveCertificates ? 'granted to' : 'revoked from'} ${updated.name}.`,
      user: toPublicUser(updated),
    });
  } catch (error) {
    console.error('Toggle admin rights error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
