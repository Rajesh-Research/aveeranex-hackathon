import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, toPublicUser } from '@/lib/auth';
import { updateUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const caller = await getAuthUserFromRequest(request);
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const isHostOrCoord =
      caller.category === 'ADMIN' ||
      caller.category === 'EVENT_COORDINATOR' ||
      caller.role === 'admin' ||
      caller.role === 'super_admin';

    if (!isHostOrCoord) {
      return NextResponse.json(
        { error: 'Only Event Hosts and Event Coordinators can customize event certificate templates.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      certOrientation,
      certBgStyle,
      certFontStyle,
      certAccentColor,
      certCustomTitle,
      certHostSignatory,
      certCustomLogoUrl,
      certLogoPosition,
      certCustomRibbonText,
      certCustomBodyText,
      certSignatures,
    } = body;

    const updated = await updateUser(caller.id, {
      certOrientation: certOrientation || 'landscape',
      certBgStyle: certBgStyle || 'classic',
      certFontStyle: certFontStyle || 'modern',
      certAccentColor: certAccentColor || '#067F92',
      certCustomTitle: certCustomTitle?.trim() || undefined,
      certHostSignatory: certHostSignatory?.trim() || undefined,
      certCustomLogoUrl: certCustomLogoUrl || undefined,
      certLogoPosition: certLogoPosition || 'center',
      certCustomRibbonText: certCustomRibbonText?.trim() || undefined,
      certCustomBodyText: certCustomBodyText?.trim() || undefined,
      certSignatures: certSignatures ? (typeof certSignatures === 'string' ? certSignatures : JSON.stringify(certSignatures)) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to save template configuration.' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Event certificate template saved successfully!',
      user: toPublicUser(updated),
    });
  } catch (error: any) {
    console.error('Save template error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
