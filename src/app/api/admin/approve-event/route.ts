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
        { error: 'Forbidden. Only Super Admin can approve hosted events.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, eventApproved } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const target = await getUserById(userId);
    if (!target) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const updated = await updateUser(userId, {
      eventApproved: Boolean(eventApproved),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update event status.' }, { status: 500 });
    }

    return NextResponse.json({
      message: `Event "${updated.assignedEvent || 'Custom Event'}" has been ${eventApproved ? 'approved and published' : 'unpublished'}.`,
      user: toPublicUser(updated),
    });
  } catch (error) {
    console.error('Approve event error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
