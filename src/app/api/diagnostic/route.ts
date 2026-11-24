import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) {
    return NextResponse.json({ error: 'No POSTGRES_URL configured' });
  }

  const pool = new Pool({ connectionString: url });
  try {
    // 1. Get columns of users table
    const colsRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    // 2. Try a test insert with try-catch to see exact error
    let testInsertError = null;
    try {
      await pool.query(`
        INSERT INTO users (
          id, name, email, contact, presented_on, password_hash, role, category,
          organization, designation, assigned_event, event_rounds
        ) VALUES (
          'test_diag_1', 'Diag User', 'diag_test@example.com', '1234567890',
          'Test Event', 'hash', 'user', 'ADMIN', 'Org', 'Desig', 'Event', '3 Rounds'
        ) ON CONFLICT (email) DO NOTHING;
      `);
      await pool.query(`DELETE FROM users WHERE id = 'test_diag_1';`);
    } catch (e: any) {
      testInsertError = {
        message: e.message,
        code: e.code,
        detail: e.detail,
      };
    }

    return NextResponse.json({
      columns: colsRes.rows.map((r: any) => r.column_name),
      testInsertError,
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      stack: err.stack,
    });
  }
}
