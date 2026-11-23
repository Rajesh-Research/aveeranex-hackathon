import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAuthUserFromRequest, toPublicUser } from '@/lib/auth';
import {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUserById,
  approveCertificate,
  rejectCertificate,
} from '@/lib/db';
import { UserCategory, AwardLevel } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const caller = await getAuthUserFromRequest(request);
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const isHostOrCoord =
      caller.category === 'ADMIN' ||
      caller.category === 'EVENT_COORDINATOR' ||
      caller.role === 'admin' ||
      caller.role === 'super_admin';

    if (!isHostOrCoord) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const eventScope = (caller.assignedEvent || caller.presentedOn || '').trim().toLowerCase();
    const allUsers = await getAllUsers();

    // Event-wise strict isolation: only return users registered under this host's event
    const eventUsers = allUsers
      .filter((u) => {
        if (u.email.toLowerCase() === 'info@aveeranex.com') return false;
        if (u.id === caller.id) return false;
        if (!eventScope) return false;
        const userEvent = (u.assignedEvent || u.presentedOn || '').trim().toLowerCase();
        return userEvent === eventScope;
      })
      .map(toPublicUser);

    return NextResponse.json({
      eventName: caller.assignedEvent || caller.presentedOn || 'My Hosted Event',
      users: eventUsers,
    });
  } catch (error) {
    console.error('Event subplatform GET error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const caller = await getAuthUserFromRequest(request);
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const isHostOrCoord =
      caller.category === 'ADMIN' ||
      caller.category === 'EVENT_COORDINATOR' ||
      caller.role === 'admin' ||
      caller.role === 'super_admin';

    if (!isHostOrCoord) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;
    const hostEventName = caller.assignedEvent || caller.presentedOn || "AVEERANEX INNOVATE - NOV'26";

    if (action === 'ONBOARD') {
      const { name, email, contact, category, organization, designation, specialization, technicalResponsibility } = body;
      if (!name?.trim() || !email?.trim() || !category) {
        return NextResponse.json({ error: 'Name, Email, and Role Category are required.' }, { status: 400 });
      }

      const existing = await getUserByEmail(email.trim());
      if (existing) {
        return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
      }

      const defaultPassword = await bcrypt.hash('Aveeranex@2026', 10);
      const created = await createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        contact: contact?.trim() || 'N/A',
        passwordHash: defaultPassword,
        role: 'user',
        category: category as UserCategory,
        presentedOn: hostEventName,
        assignedEvent: hostEventName,
        organization: organization?.trim() || caller.organization || caller.college,
        college: organization?.trim() || caller.college || caller.organization,
        designation: designation?.trim(),
        specialization: specialization?.trim(),
        technicalResponsibility: technicalResponsibility?.trim(),
        awardLevel: 'PARTICIPATION',
      });

      return NextResponse.json({
        message: `${name} onboarded to "${hostEventName}" successfully!`,
        user: toPublicUser(created),
      });
    }

    if (action === 'APPROVE') {
      const { userId, awardLevel, includeParticipationToo, awardOrientation, runnerTheme } = body;
      const target = await getUserById(userId);
      if (!target) {
        return NextResponse.json({ error: 'Recipient not found.' }, { status: 404 });
      }

      const updated = await approveCertificate(
        userId,
        caller.name,
        (awardLevel as AwardLevel) || 'PARTICIPATION',
        includeParticipationToo !== undefined ? Boolean(includeParticipationToo) : true,
        awardOrientation,
        runnerTheme
      );
      return NextResponse.json({
        message: `Certificate approved for ${target.name}!`,
        user: updated ? toPublicUser(updated) : null,
      });
    }

    if (action === 'REJECT') {
      const { userId, reason } = body;
      const updated = await rejectCertificate(userId, reason || 'Did not meet event criteria.');
      return NextResponse.json({
        message: 'Certificate request declined.',
        user: updated ? toPublicUser(updated) : null,
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Event subplatform POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
