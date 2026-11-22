import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, toPublicUser } from '@/lib/auth';
import { requestCertificate } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    if (user.certificateStatus === 'APPROVED') {
      return NextResponse.json(
        { message: 'Certificate is already approved!', user: toPublicUser(user) },
        { status: 200 }
      );
    }

    const updatedUser = await requestCertificate(user.id);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Certificate generation request submitted for Super Admin approval.',
      user: toPublicUser(updatedUser),
    });
  } catch (error: any) {
    console.error('Certificate request error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
