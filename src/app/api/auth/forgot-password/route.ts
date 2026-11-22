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

    const resetData = createPasswordResetToken(email.trim());

    if (!resetData) {
      // Return success for security so user enumeration is avoided, but provide helpful feedback
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been dispatched.',
      });
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://aveeranex-hackathon.vercel.app';
    const resetLink = `${origin}/reset-password?token=${resetData.token}`;

    await sendPasswordResetEmail(resetData.user, resetLink);

    return NextResponse.json({
      message: 'Password reset link sent to your email address.',
      // In development / demo when SMTP is not yet configured, provide resetLink in response for smooth testing
      debugResetLink: process.env.NODE_ENV !== 'production' || !process.env.SMTP_HOST ? resetLink : undefined,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process password reset request.' }, { status: 500 });
  }
}
