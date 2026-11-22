import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { getAllUsers } from '@/lib/db';
import { syncToGoogleSheets, syncApprovalToGoogleSheets } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const caller = await getAuthUserFromRequest(request);
    if (!caller || caller.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const allUsers = await getAllUsers();
    const participants = allUsers.filter((u) => u.role !== 'admin');

    let syncedCount = 0;
    for (const p of participants) {
      if (p.certificateStatus === 'APPROVED') {
        const ok = await syncApprovalToGoogleSheets(p);
        if (ok) syncedCount++;
      } else {
        const ok = await syncToGoogleSheets(p);
        if (ok) syncedCount++;
      }
    }

    return NextResponse.json({
      message: `Successfully synced ${syncedCount} of ${participants.length} participants to Google Sheets.`,
      total: participants.length,
      synced: syncedCount,
    });
  } catch (err) {
    console.error('Sync to sheets error:', err);
    return NextResponse.json({ error: 'Failed to sync to Google Sheets.' }, { status: 500 });
  }
}
