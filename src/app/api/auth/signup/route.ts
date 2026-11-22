import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from '@/lib/db';
import { signToken, toPublicUser } from '@/lib/auth';
import {
  sendRegistrationEmailAlert,
  syncToGoogleSheets,
  sendParticipantWelcomeEmail,
} from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      teamName,
      email,
      contact,
      college,
      location,
      state,
      country,
      pincode,
      topicTitle,
      topicDomain,
      presentedOn,
      password,
    } = body;

    // Validate required fields
    if (
      !name?.trim() ||
      !teamName?.trim() ||
      !email?.trim() ||
      !contact?.trim() ||
      !college?.trim() ||
      !location?.trim() ||
      !state?.trim() ||
      !country?.trim() ||
      !pincode?.trim() ||
      !topicTitle?.trim() ||
      !topicDomain?.trim() ||
      !presentedOn?.trim() ||
      !password?.trim()
    ) {
      return NextResponse.json(
        { error: 'All fields are required. Please fill in all registration details.' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await getUserByEmail(email.trim());
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await createUser({
      name: name.trim(),
      teamName: teamName.trim(),
      email: email.trim().toLowerCase(),
      contact: contact.trim(),
      college: college.trim(),
      location: location.trim(),
      state: state.trim(),
      country: country.trim(),
      pincode: pincode.trim(),
      topicTitle: topicTitle.trim(),
      topicDomain: topicDomain.trim(),
      presentedOn: presentedOn.trim(),
      passwordHash,
      role: 'user',
    });

    // Dispatch confirmation email to participant, alert to info@aveeranex.com & sync to Google Sheets
    await Promise.allSettled([
      sendParticipantWelcomeEmail(newUser),
      sendRegistrationEmailAlert(newUser),
      syncToGoogleSheets(newUser),
    ]).catch((e) => console.error('Notification dispatch error:', e));

    const token = signToken(newUser);
    const publicUser = toPublicUser(newUser);

    const response = NextResponse.json(
      {
        message: 'Registration successful! Welcome to Aveeranex Hackathon.',
        user: publicUser,
        token,
      },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set('avx_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
