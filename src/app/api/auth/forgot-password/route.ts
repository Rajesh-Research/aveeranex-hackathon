import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const resetData = await createPasswordResetToken(email.trim());

    if (!resetData) {
      return NextResponse.json(
        {
          error: `No registered account found with email "${email.trim()}". Please check your spelling, or use the "Forgot Email / Find Account" tab below to search by phone number or name.`,
        },
        { status: 404 }
      );
    }

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://aveeranex-hackathon.vercel.app';
    const resetLink = `${origin}/reset-password?token=${resetData.token}`;

    await sendPasswordResetEmail(resetData.user, resetLink);

    return NextResponse.json({
      message: 'Password reset link generated successfully.',
      debugResetLink: resetLink,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process password reset request.' }, { status: 500 });
  }
}
