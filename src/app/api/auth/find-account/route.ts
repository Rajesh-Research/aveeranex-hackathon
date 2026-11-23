import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createPasswordResetToken } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'Please enter your phone number, name, or certificate ID to find your account.' },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim().toLowerCase();
    const cleanDigits = query.replace(/\D/g, '');

    const users = await getAllUsers();

    const matches = users.filter((u) => {
      // 1. Phone match (if at least 6 digits provided)
      if (cleanDigits.length >= 6) {
        const userPhoneDigits = (u.contact || '').replace(/\D/g, '');
        if (userPhoneDigits.includes(cleanDigits) || cleanDigits.includes(userPhoneDigits)) {
          return true;
        }
      }

      // 2. Name match (case-insensitive)
      if (cleanQuery.length >= 3 && u.name.toLowerCase().includes(cleanQuery)) {
        return true;
      }

      // 3. Certificate ID match
      if (u.certificateId && u.certificateId.toLowerCase().includes(cleanQuery)) {
        return true;
      }

      // 4. Email exact or domain match
      if (u.email && u.email.toLowerCase().includes(cleanQuery)) {
        return true;
      }

      return false;
    });

    if (matches.length === 0) {
      return NextResponse.json(
        {
          accounts: [],
          message: 'No registered accounts found matching your query. Please verify details or contact info@aveeranex.com.',
        },
        { status: 200 }
      );
    }

    // Prepare safe results with direct reset token generation for convenience
    const accounts = await Promise.all(
      matches.slice(0, 5).map(async (u) => {
        // Generate a reset token so the user can immediately reset in 1-click
        const resetData = await createPasswordResetToken(u.email);
        const origin =
          request.headers.get('origin') ||
          process.env.NEXT_PUBLIC_APP_URL ||
          'https://aveeranex-hackathon.vercel.app';
        const directResetUrl = resetData
          ? `${origin}/reset-password?token=${resetData.token}`
          : null;

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          contact: u.contact,
          role: u.role,
          category: u.category || 'PARTICIPANT',
          certificateId: u.certificateId,
          directResetUrl,
        };
      })
    );

    return NextResponse.json({
      accounts,
      message: `Found ${accounts.length} matching registered account(s).`,
    });
  } catch (error: any) {
    console.error('Find account error:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching for your account.' },
      { status: 500 }
    );
  }
}
