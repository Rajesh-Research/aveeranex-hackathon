import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allUsers = await getAllUsers();
    const approvedEvents = allUsers
      .filter((u) => u.eventApproved && u.assignedEvent)
      .map((u) => ({
        name: u.assignedEvent as string,
        hostName: u.name,
        organization: u.organization || u.college || 'Aveeranex Partner',
        rounds: u.eventRounds || '',
        dates: u.eventDates || '',
        prizes: u.eventPrizes || '',
        bannerUrl: u.eventBannerUrl || '',
        description: u.eventDescription || '',
      }));

    // Deduplicate by name, keeping AVEERANEX INNOVATE - NOV'26 as baseline
    const eventNames = Array.from(
      new Set([
        "AVEERANEX INNOVATE - NOV'26",
        ...approvedEvents.map((e) => e.name),
      ])
    );

    return NextResponse.json({
      events: eventNames,
      details: approvedEvents,
    });
  } catch (error) {
    console.error('Fetch public events error:', error);
    return NextResponse.json({ events: ["AVEERANEX INNOVATE - NOV'26"], details: [] });
  }
}
