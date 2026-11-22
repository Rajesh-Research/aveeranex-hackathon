import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/lib/db';
import { signToken, toPublicUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email.trim());
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = signToken(user);
    const publicUser = toPublicUser(user);

    const response = NextResponse.json(
      {
        message: 'Signed in successfully!',
        user: publicUser,
        token,
      },
      { status: 200 }
    );

    response.cookies.set('avx_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signin.' },
      { status: 500 }
    );
  }
}
