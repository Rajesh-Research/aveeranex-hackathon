import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, toPublicUser } from '@/lib/auth';
import { getAllUsers, isPostgresConnected } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const caller = await getAuthUserFromRequest(request);
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const isSuperAdmin = caller.role === 'super_admin' || caller.email.toLowerCase() === 'info@aveeranex.com';
    const isNormalAdmin = caller.role === 'admin';

    if (!isSuperAdmin && !isNormalAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const allUsers = await getAllUsers();
    // Exclude the root super admin from lists, show all other participants & stakeholders
    const nonRootUsers = allUsers.filter(
      (u) => u.email.toLowerCase() !== 'info@aveeranex.com'
    );

    // If caller is normal admin, they can manage participants and see non-admin users
    const visibleUsers = isSuperAdmin 
      ? nonRootUsers 
      : nonRootUsers.filter((u) => u.role !== 'admin' && u.category !== 'ADMIN');

    const publicList = visibleUsers.map(toPublicUser);

    const stats = {
      total: publicList.length,
      participants: publicList.filter((p) => (p.category || 'PARTICIPANT') === 'PARTICIPANT').length,
      mentors: publicList.filter((p) => p.category === 'MENTOR_JURY').length,
      techCoordinators: publicList.filter((p) => p.category === 'TECHNICAL_COORDINATOR').length,
      eventCoordinators: publicList.filter((p) => p.category === 'EVENT_COORDINATOR').length,
      admins: nonRootUsers.filter((p) => p.role === 'admin' || p.category === 'ADMIN').length,
      pending: publicList.filter((p) => p.certificateStatus === 'PENDING_APPROVAL').length,
      approved: publicList.filter((p) => p.certificateStatus === 'APPROVED').length,
      rejected: publicList.filter((p) => p.certificateStatus === 'REJECTED').length,
      notRequested: publicList.filter((p) => p.certificateStatus === 'NOT_REQUESTED').length,
      isPostgres: isPostgresConnected(),
    };

    return NextResponse.json({ 
      participants: publicList, 
      stats,
      caller: toPublicUser(caller)
    });
  } catch (error) {
    console.error('Admin participants fetch error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
