import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from '@/lib/db';
import { signToken, toPublicUser } from '@/lib/auth';
import {
  sendRegistrationEmailAlert,
  syncToGoogleSheets,
  sendParticipantWelcomeEmail,
} from '@/lib/notifications';
import { UserCategory, UserRole } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const category: UserCategory = body.category || 'PARTICIPANT';

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
      organization,
      designation,
      specialization,
      technicalResponsibility,
      committeeRole,
      linkedinUrl,
      assignedEvent,
      eventRounds,
      eventDates,
      eventPrizes,
      eventBannerUrl,
      eventDescription,
      password,
    } = body;

    // Common validations
    if (!name?.trim() || !email?.trim() || !contact?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Name, Email, Contact Number, and Password are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // Role-specific validation
    if (category === 'PARTICIPANT') {
      if (
        !teamName?.trim() ||
        !college?.trim() ||
        !location?.trim() ||
        !state?.trim() ||
        !topicTitle?.trim() ||
        !topicDomain?.trim() ||
        !presentedOn?.trim()
      ) {
        return NextResponse.json(
          { error: 'All participant fields (Team Name, College, Location, Topic, Domain, Event) are required.' },
          { status: 400 }
        );
      }
    } else if (category === 'MENTOR_JURY') {
      if (!organization?.trim() || !designation?.trim() || !specialization?.trim() || !presentedOn?.trim()) {
        return NextResponse.json(
          { error: 'Organization / Company, Designation, Specialization Domain, and Event Name are required for Mentors & Jury.' },
          { status: 400 }
        );
      }
    } else if (category === 'TECHNICAL_COORDINATOR') {
      if (!college?.trim() || !technicalResponsibility?.trim() || !presentedOn?.trim()) {
        return NextResponse.json(
          { error: 'Institution / College, Technical Domain / Responsibility, and Event Name are required.' },
          { status: 400 }
        );
      }
    } else if (category === 'EVENT_COORDINATOR') {
      if (!college?.trim() || !committeeRole?.trim() || (!assignedEvent?.trim() && !presentedOn?.trim())) {
        return NextResponse.json(
          { error: 'Institution / College, Organizing Role / Committee Scope, and Event Name are required.' },
          { status: 400 }
        );
      }
    } else if (category === 'ADMIN') {
      if (!organization?.trim() || !designation?.trim() || (!assignedEvent?.trim() && !presentedOn?.trim())) {
        return NextResponse.json(
          { error: 'Organization / Institution Name, Admin Designation, and Event Name to Host are required.' },
          { status: 400 }
        );
      }
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

    const userRole: UserRole = category === 'ADMIN' ? 'admin' : 'user';

    // Create user
    const newUser = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      contact: contact.trim(),
      passwordHash,
      role: userRole,
      category,
      presentedOn: presentedOn?.trim() || assignedEvent?.trim() || "AVEERANEX INNOVATE ONLINE HACKATHON  Nov'26",

      // Participant
      teamName: teamName?.trim(),
      college: college?.trim(),
      location: location?.trim(),
      state: state?.trim(),
      country: country?.trim() || 'India',
      pincode: pincode?.trim(),
      topicTitle: topicTitle?.trim(),
      topicDomain: topicDomain?.trim(),
      awardLevel: 'PARTICIPATION',

      // Mentor / Coordinator / Admin
      organization: organization?.trim(),
      designation: designation?.trim(),
      specialization: specialization?.trim(),
      technicalResponsibility: technicalResponsibility?.trim(),
      committeeRole: committeeRole?.trim(),
      linkedinUrl: linkedinUrl?.trim(),
      assignedEvent: assignedEvent?.trim() || presentedOn?.trim(),
      eventRounds: eventRounds?.trim(),
      eventDates: eventDates?.trim(),
      eventPrizes: eventPrizes?.trim(),
      eventBannerUrl: eventBannerUrl?.trim(),
      eventDescription: eventDescription?.trim(),
      eventApproved: false,
      canApproveCertificates: false, // Must be granted by Super Admin!
    });

    // Dispatch background alerts
    await Promise.allSettled([
      sendParticipantWelcomeEmail(newUser),
      sendRegistrationEmailAlert(newUser),
      syncToGoogleSheets(newUser),
    ]).catch((e) => console.error('Notification dispatch error:', e));

    const token = signToken(newUser);
    const publicUser = toPublicUser(newUser);

    const response = NextResponse.json(
      {
        message: `Registration successful as ${category.replace(/_/g, ' ')}! Welcome to Aveeranex.`,
        user: publicUser,
        token,
      },
      { status: 201 }
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
