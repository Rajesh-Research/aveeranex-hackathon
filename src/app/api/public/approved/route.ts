import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allUsers = await getAllUsers();
    const approvedList = allUsers
      .filter(
        (u) =>
          u.certificateStatus === 'APPROVED' &&
          u.email.toLowerCase() !== 'info@aveeranex.com'
      )
      .map((u) => ({
        id: u.id,
        name: u.name,
        category: u.category || 'PARTICIPANT',
        awardLevel: u.awardLevel || 'PARTICIPATION',
        teamName: u.category === 'MENTOR_JURY' ? undefined : u.teamName,
        college: u.college || u.organization || '',
        organization: u.organization || u.college || '',
        designation: u.designation || '',
        specialization: u.specialization || '',
        topicTitle: u.topicTitle || '',
        presentedOn: u.assignedEvent || u.presentedOn || "AVEERANEX INNOVATE - NOV'26",
        certificateId: u.certificateId || '',
        approvedAt: u.certificateApprovedAt || u.createdAt,
      }));

    return NextResponse.json({ approved: approvedList });
  } catch (error) {
    console.error('Error fetching approved list:', error);
    return NextResponse.json({ approved: [] }, { status: 500 });
  }
}
