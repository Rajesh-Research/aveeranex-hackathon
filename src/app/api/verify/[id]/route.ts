import { NextRequest, NextResponse } from 'next/server';
import { getUserByCertificateId } from '@/lib/db';
import { CertificateVerificationData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certId = params.id;
    if (!certId) {
      return NextResponse.json({ error: 'Certificate ID is required' }, { status: 400 });
    }

    const user = await getUserByCertificateId(certId);

    if (!user || user.certificateStatus !== 'APPROVED') {
      return NextResponse.json(
        {
          status: 'NOT_FOUND',
          message: 'Certificate not found or not yet approved.',
        },
        { status: 404 }
      );
    }

    const isParticipationLookup =
      user.participationCertificateId &&
      certId.trim().toUpperCase() === user.participationCertificateId.trim().toUpperCase();

    const verificationData: CertificateVerificationData = {
      certificateId: isParticipationLookup ? user.participationCertificateId! : (user.certificateId || certId),
      participantName: user.name,
      category: user.category || 'PARTICIPANT',
      awardLevel: isParticipationLookup ? 'PARTICIPATION' : (user.awardLevel || 'PARTICIPATION'),
      teamName: user.teamName,
      topicTitle: user.topicTitle,
      topicDomain: user.topicDomain,
      presentedOn: user.assignedEvent || user.presentedOn,
      college: user.college,
      organization: user.organization,
      designation: user.designation,
      specialization: user.specialization,
      technicalResponsibility: user.technicalResponsibility,
      committeeRole: user.committeeRole,
      issueDate: user.certificateApprovedAt
        ? new Date(user.certificateApprovedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '22 November 2026',
      status: 'VALID',
      directorName: 'Dr. Rajesh Kumar',
      organizationName: 'AVEERANEX (OPC) PRIVATE LIMITED',
      verificationHash: `SHA256-${Buffer.from(`${user.certificateId}:${user.email}`).toString('hex').slice(0, 16)}`,
    };

    return NextResponse.json(verificationData);
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
