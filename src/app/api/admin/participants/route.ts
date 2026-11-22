import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, toPublicUser } from '@/lib/auth';
import { getAllUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const caller = getAuthUserFromRequest(request);
    if (!caller || caller.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Super Admin access required.' },
        { status: 403 }
      );
    }

    const allUsers = getAllUsers();
    const participants = allUsers
      .filter((u) => u.role !== 'admin')
      .map(toPublicUser);

    const stats = {
      total: participants.length,
      pending: participants.filter((p) => p.certificateStatus === 'PENDING_APPROVAL').length,
      approved: participants.filter((p) => p.certificateStatus === 'APPROVED').length,
      rejected: participants.filter((p) => p.certificateStatus === 'REJECTED').length,
      notRequested: participants.filter((p) => p.certificateStatus === 'NOT_REQUESTED').length,
    };

    return NextResponse.json({ participants, stats });
  } catch (error) {
    console.error('Admin participants fetch error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
