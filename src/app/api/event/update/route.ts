import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, toPublicUser } from '@/lib/auth';
import { updateUser } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const caller = await getAuthUserFromRequest(request);
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (caller.category !== 'ADMIN' && caller.category !== 'EVENT_COORDINATOR' && caller.role !== 'admin') {
      return NextResponse.json({ error: 'Only Host Admins and Event Coordinators can update hosted event details.' }, { status: 403 });
    }

    const formData = await request.formData();
    const assignedEvent = (formData.get('assignedEvent') as string) || caller.assignedEvent;
    const eventRounds = (formData.get('eventRounds') as string) || '';
    const eventDates = (formData.get('eventDates') as string) || '';
    const eventPrizes = (formData.get('eventPrizes') as string) || '';
    const eventDescription = (formData.get('eventDescription') as string) || '';
    const bannerFile = formData.get('banner') as File | null;

    let eventBannerUrl = caller.eventBannerUrl;

    if (bannerFile && bannerFile.size > 0) {
      if (bannerFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Banner image must be under 5 MB.' }, { status: 400 });
      }
      const ext = path.extname(bannerFile.name).toLowerCase();
      if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
        return NextResponse.json({ error: 'Banner must be PNG, JPG, or WEBP format (Recommended 1200 x 630 px).' }, { status: 400 });
      }

      const bytes = await bannerFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `banner_${caller.id.slice(0, 8)}_${Date.now()}${ext}`;
      try {
        if (process.env.VERCEL) {
          throw new Error('Serverless read-only FS');
        }
        const bannersDir = path.join(process.cwd(), 'public', 'uploads', 'banners');
        if (!fs.existsSync(bannersDir)) {
          fs.mkdirSync(bannersDir, { recursive: true });
        }
        fs.writeFileSync(path.join(bannersDir, fileName), buffer);
        eventBannerUrl = `/uploads/banners/${fileName}`;
      } catch {
        const mimeType =
          ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        eventBannerUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }
    }

    const updated = await updateUser(caller.id, {
      assignedEvent: assignedEvent?.trim(),
      eventRounds: eventRounds.trim(),
      eventDates: eventDates.trim(),
      eventPrizes: eventPrizes.trim(),
      eventDescription: eventDescription.trim(),
      eventBannerUrl,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update event details.' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Event hosting details updated and queued for Super Admin approval!',
      user: toPublicUser(updated),
    });
  } catch (error: any) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
