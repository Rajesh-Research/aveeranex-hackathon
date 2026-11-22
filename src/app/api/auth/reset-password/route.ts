import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { resetPasswordWithToken, getUserByResetToken } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token?.trim()) {
      return NextResponse.json({ error: 'Reset token is required or has expired.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const user = await getUserByResetToken(token.trim());
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    const newPasswordHash = await bcrypt.hash(password, 10);
    const updatedUser = await resetPasswordWithToken(token.trim(), newPasswordHash);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to reset password. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Your password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
