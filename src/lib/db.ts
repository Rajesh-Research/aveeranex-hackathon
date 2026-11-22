import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Pool } from '@neondatabase/serverless';
import { User, CertificateStatus } from './types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// In-memory cache for fast reads and fallback
let memoryUsers: User[] = [];
let memoryInitialized = false;

// Postgres connection pool
let pool: Pool | null = null;
let initPromise: Promise<void> | null = null;

function getPool(): Pool | null {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) return null;
  if (!pool) {
    try {
      pool = new Pool({ connectionString: url });
    } catch (err) {
      console.error('Error creating Postgres pool:', err);
    }
  }
  return pool;
}

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

function loadUsersFromDisk(): User[] {
  try {
    ensureDataDirectory();
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading users from disk:', err);
  }
  return [];
}

function saveUsersToDisk(users: User[]) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users to disk:', err);
  }
}

function rowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    teamName: row.team_name,
    email: row.email,
    contact: row.contact,
    college: row.college,
    location: row.location,
    state: row.state,
    country: row.country,
    pincode: row.pincode,
    topicTitle: row.topic_title,
    topicDomain: row.topic_domain,
    presentedOn: row.presented_on,
    passwordHash: row.password_hash,
    role: row.role as 'user' | 'admin',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    certificateStatus: row.certificate_status as CertificateStatus,
    certificateId: row.certificate_id || undefined,
    certificateApprovedAt: row.certificate_approved_at
      ? new Date(row.certificate_approved_at).toISOString()
      : undefined,
    certificateApprovedBy: row.certificate_approved_by || undefined,
    rejectionReason: row.rejection_reason || undefined,
    resetPasswordToken: row.reset_password_token || undefined,
    resetPasswordExpires: row.reset_password_expires
      ? new Date(row.reset_password_expires).toISOString()
      : undefined,
  };
}

function initMemoryDatabase() {
  if (memoryInitialized) return;

  let users = loadUsersFromDisk();
  const adminEmail = 'info@aveeranex.com';
  const existingAdmin = users.find((u) => u.email.toLowerCase() === adminEmail);

  if (!existingAdmin) {
    const adminPasswordHash = bcrypt.hashSync('aveeranex@123', 10);
    const superAdmin: User = {
      id: 'usr_admin_001',
      name: 'Dr. Rajesh Kumar (Director)',
      teamName: 'AVEERANEX Leadership',
      email: adminEmail,
      contact: '+91 9876543210',
      college: 'AVEERANEX Headquarters',
      location: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001',
      topicTitle: 'AVEERANEX Innovate Hackathon 2026 Super Admin',
      topicDomain: 'Leadership & Research',
      presentedOn: "AVEERANEX INNOVATE ONLINE HACKATHON  Nov'26",
      passwordHash: adminPasswordHash,
      role: 'admin',
      createdAt: '2026-11-20T10:00:00.000Z',
      certificateStatus: 'APPROVED',
      certificateId: 'AVX-2026-NOV-ADMIN',
      certificateApprovedAt: '2026-11-22T10:00:00.000Z',
      certificateApprovedBy: 'SUPER_ADMIN',
    };
    users.unshift(superAdmin);
  }

  memoryUsers = users;
  saveUsersToDisk(users);
  memoryInitialized = true;
}

export async function initDatabase(): Promise<void> {
  initMemoryDatabase();

  const p = getPool();
  if (!p) return;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        await p.query(`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            team_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            contact VARCHAR(100) NOT NULL,
            college VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            state VARCHAR(255) NOT NULL,
            country VARCHAR(100) NOT NULL,
            pincode VARCHAR(50) NOT NULL,
            topic_title TEXT NOT NULL,
            topic_domain VARCHAR(255) NOT NULL,
            presented_on VARCHAR(255) NOT NULL,
            password_hash TEXT NOT NULL,
            role VARCHAR(50) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            certificate_status VARCHAR(50) NOT NULL,
            certificate_id VARCHAR(100),
            certificate_approved_at TIMESTAMPTZ,
            certificate_approved_by VARCHAR(255),
            rejection_reason TEXT,
            reset_password_token TEXT,
            reset_password_expires TIMESTAMPTZ
          );
          ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMPTZ;
        `);

        // Check if admin exists in Postgres
        const adminRes = await p.query(
          'SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1',
          ['info@aveeranex.com']
        );

        if (adminRes.rows.length === 0) {
          const adminPasswordHash = bcrypt.hashSync('aveeranex@123', 10);
          await p.query(
            `INSERT INTO users (
               id, name, team_name, email, contact, college, location, state, country, pincode,
               topic_title, topic_domain, presented_on, password_hash, role, certificate_status,
               certificate_id, certificate_approved_at, certificate_approved_by, created_at
             ) VALUES (
               'usr_admin_001', 'Dr. Rajesh Kumar (Director)', 'AVEERANEX Leadership', 'info@aveeranex.com',
               '+91 9876543210', 'AVEERANEX Headquarters', 'Bengaluru', 'Karnataka', 'India', '560001',
               'AVEERANEX Innovate Hackathon 2026 Super Admin', 'Leadership & Research',
               'AVEERANEX INNOVATE ONLINE HACKATHON  Nov''26', $1, 'admin', 'APPROVED',
               'AVX-2026-NOV-ADMIN', NOW(), 'SUPER_ADMIN', NOW()
             ) ON CONFLICT (email) DO NOTHING`,
            [adminPasswordHash]
          );
        }

        // Migrate seed users from disk if not present in Postgres
        const diskUsers = loadUsersFromDisk();
        for (const u of diskUsers) {
          if (u.role !== 'admin') {
            await p.query(
              `INSERT INTO users (
                 id, name, team_name, email, contact, college, location, state, country, pincode,
                 topic_title, topic_domain, presented_on, password_hash, role, certificate_status,
                 certificate_id, certificate_approved_at, certificate_approved_by, created_at
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
               ON CONFLICT (email) DO UPDATE SET
                 certificate_status = EXCLUDED.certificate_status,
                 certificate_id = COALESCE(users.certificate_id, EXCLUDED.certificate_id),
                 certificate_approved_at = COALESCE(users.certificate_approved_at, EXCLUDED.certificate_approved_at),
                 certificate_approved_by = COALESCE(users.certificate_approved_by, EXCLUDED.certificate_approved_by)`,
              [
                u.id,
                u.name,
                u.teamName,
                u.email,
                u.contact,
                u.college,
                u.location,
                u.state,
                u.country,
                u.pincode,
                u.topicTitle,
                u.topicDomain,
                u.presentedOn,
                u.passwordHash,
                u.role,
                u.certificateStatus,
                u.certificateId || null,
                u.certificateApprovedAt || null,
                u.certificateApprovedBy || null,
                u.createdAt || new Date().toISOString(),
              ]
            ).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Postgres initDatabase error:', err);
      }
    })();
  }

  await initPromise;
}

export function isPostgresConnected(): boolean {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

export async function getAllUsers(): Promise<User[]> {
  await initDatabase();
  const p = getPool();
  if (p) {
    try {
      const res = await p.query('SELECT * FROM users ORDER BY created_at DESC');
      const users = res.rows.map(rowToUser);
      memoryUsers = users;
      return users;
    } catch (err) {
      console.error('Postgres getAllUsers error, falling back to memory:', err);
    }
  }
  return memoryUsers;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  if (!email) return undefined;
  await initDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const p = getPool();
  if (p) {
    try {
      const res = await p.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
      if (res.rows.length > 0) {
        return rowToUser(res.rows[0]);
      }
      return undefined;
    } catch (err) {
      console.error('Postgres getUserByEmail error, falling back to memory:', err);
    }
  }
  return memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
}

export async function getUserById(id: string): Promise<User | undefined> {
  if (!id) return undefined;
  await initDatabase();
  const p = getPool();
  if (p) {
    try {
      const res = await p.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length > 0) {
        return rowToUser(res.rows[0]);
      }
      return undefined;
    } catch (err) {
      console.error('Postgres getUserById error, falling back to memory:', err);
    }
  }
  return memoryUsers.find((u) => u.id === id);
}

export async function getUserByCertificateId(certId: string): Promise<User | undefined> {
  if (!certId) return undefined;
  await initDatabase();
  const normalized = certId.trim().toUpperCase();
  const p = getPool();
  if (p) {
    try {
      const res = await p.query(
        'SELECT * FROM users WHERE UPPER(certificate_id) = $1 LIMIT 1',
        [normalized]
      );
      if (res.rows.length > 0) {
        return rowToUser(res.rows[0]);
      }
      return undefined;
    } catch (err) {
      console.error('Postgres getUserByCertificateId error, falling back to memory:', err);
    }
  }
  return memoryUsers.find((u) => u.certificateId?.toUpperCase() === normalized);
}

export async function createUser(
  userData: Omit<User, 'id' | 'createdAt' | 'certificateStatus'>
): Promise<User> {
  await initDatabase();
  const newUser: User = {
    ...userData,
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    certificateStatus: 'NOT_REQUESTED',
  };

  const p = getPool();
  if (p) {
    try {
      await p.query(
        `INSERT INTO users (
           id, name, team_name, email, contact, college, location, state, country, pincode,
           topic_title, topic_domain, presented_on, password_hash, role, created_at, certificate_status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           team_name = EXCLUDED.team_name,
           contact = EXCLUDED.contact,
           college = EXCLUDED.college,
           location = EXCLUDED.location,
           state = EXCLUDED.state,
           country = EXCLUDED.country,
           pincode = EXCLUDED.pincode,
           topic_title = EXCLUDED.topic_title,
           topic_domain = EXCLUDED.topic_domain,
           presented_on = EXCLUDED.presented_on`,
        [
          newUser.id,
          newUser.name,
          newUser.teamName,
          newUser.email,
          newUser.contact,
          newUser.college,
          newUser.location,
          newUser.state,
          newUser.country,
          newUser.pincode,
          newUser.topicTitle,
          newUser.topicDomain,
          newUser.presentedOn,
          newUser.passwordHash,
          newUser.role,
          newUser.createdAt,
          newUser.certificateStatus,
        ]
      );
    } catch (err) {
      console.error('Postgres createUser error:', err);
    }
  }

  // Update memory and disk
  const existingIdx = memoryUsers.findIndex((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
  if (existingIdx !== -1) {
    memoryUsers[existingIdx] = newUser;
  } else {
    memoryUsers.unshift(newUser);
  }
  saveUsersToDisk(memoryUsers);

  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  await initDatabase();

  const p = getPool();
  if (p) {
    try {
      const existing = await getUserById(id);
      if (!existing) return null;

      const merged: User = { ...existing, ...updates };

      await p.query(
        `UPDATE users SET
           certificate_status = $1,
           certificate_id = $2,
           certificate_approved_at = $3,
           certificate_approved_by = $4,
           rejection_reason = $5,
           password_hash = $6,
           reset_password_token = $7,
           reset_password_expires = $8
         WHERE id = $9`,
        [
          merged.certificateStatus,
          merged.certificateId || null,
          merged.certificateApprovedAt || null,
          merged.certificateApprovedBy || null,
          merged.rejectionReason || null,
          merged.passwordHash,
          merged.resetPasswordToken || null,
          merged.resetPasswordExpires || null,
          id,
        ]
      );

      const memIdx = memoryUsers.findIndex((u) => u.id === id);
      if (memIdx !== -1) {
        memoryUsers[memIdx] = merged;
      }
      saveUsersToDisk(memoryUsers);
      return merged;
    } catch (err) {
      console.error('Postgres updateUser error:', err);
    }
  }

  // Fallback to memory
  const index = memoryUsers.findIndex((u) => u.id === id);
  if (index === -1) return null;

  memoryUsers[index] = {
    ...memoryUsers[index],
    ...updates,
  };
  saveUsersToDisk(memoryUsers);
  return memoryUsers[index];
}

export async function requestCertificate(userId: string): Promise<User | null> {
  return updateUser(userId, {
    certificateStatus: 'PENDING_APPROVAL',
  });
}

export async function approveCertificate(userId: string, adminName: string): Promise<User | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const certId = user.certificateId || `AVX-2026-NOV-${randomSuffix}`;

  const updated = await updateUser(userId, {
    certificateStatus: 'APPROVED',
    certificateId: certId,
    certificateApprovedAt: new Date().toISOString(),
    certificateApprovedBy: adminName || 'Dr. Rajesh Kumar (Director)',
    rejectionReason: undefined,
  });

  return updated;
}

export async function rejectCertificate(userId: string, reason: string): Promise<User | null> {
  return updateUser(userId, {
    certificateStatus: 'REJECTED',
    rejectionReason: reason || 'Details did not match hackathon submission criteria.',
  });
}

export async function createPasswordResetToken(
  email: string
): Promise<{ token: string; user: User } | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour

  await updateUser(user.id, {
    resetPasswordToken: token,
    resetPasswordExpires: expires,
  });

  return { token, user };
}

export async function getUserByResetToken(token: string): Promise<User | null> {
  await initDatabase();
  const p = getPool();
  if (p) {
    try {
      const res = await p.query(
        `SELECT * FROM users
         WHERE reset_password_token = $1
           AND reset_password_expires > NOW()
         LIMIT 1`,
        [token]
      );
      if (res.rows.length > 0) {
        return rowToUser(res.rows[0]);
      }
      return null;
    } catch (err) {
      console.error('Postgres getUserByResetToken error:', err);
    }
  }

  const user = memoryUsers.find(
    (u) =>
      u.resetPasswordToken === token &&
      u.resetPasswordExpires &&
      new Date(u.resetPasswordExpires) > new Date()
  );
  return user || null;
}

export async function resetPasswordWithToken(
  token: string,
  newPasswordHash: string
): Promise<User | null> {
  const user = await getUserByResetToken(token);
  if (!user) return null;

  return updateUser(user.id, {
    passwordHash: newPasswordHash,
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
  });
}
