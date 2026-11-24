import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Pool } from '@neondatabase/serverless';
import { User, CertificateStatus, UserCategory, AwardLevel } from './types';

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
    teamName: row.team_name || undefined,
    email: row.email,
    contact: row.contact,
    college: row.college || undefined,
    location: row.location || undefined,
    state: row.state || undefined,
    country: row.country || undefined,
    pincode: row.pincode || undefined,
    topicTitle: row.topic_title || undefined,
    topicDomain: row.topic_domain || undefined,
    presentedOn: row.presented_on || "AVEERANEX INNOVATE ONLINE HACKATHON  Nov'26",
    passwordHash: row.password_hash,
    role: row.role as 'user' | 'admin' | 'super_admin',
    category: (row.category || 'PARTICIPANT') as UserCategory,
    awardLevel: (row.award_level || 'PARTICIPATION') as AwardLevel,
    awardOrientation: (row.award_orientation || undefined) as 'landscape' | 'portrait' | undefined,
    runnerTheme: (row.runner_theme || undefined) as 'white' | 'black' | undefined,
    organization: row.organization || undefined,
    designation: row.designation || undefined,
    specialization: row.specialization || undefined,
    technicalResponsibility: row.technical_responsibility || undefined,
    committeeRole: row.committee_role || undefined,
    linkedinUrl: row.linkedin_url || undefined,
    canApproveCertificates: Boolean(row.can_approve_certificates),
    assignedEvent: row.assigned_event || undefined,
    eventRounds: row.event_rounds || undefined,
    eventDates: row.event_dates || undefined,
    eventPrizes: row.event_prizes || undefined,
    eventBannerUrl: row.event_banner_url || undefined,
    eventDescription: row.event_description || undefined,
    eventApproved: Boolean(row.event_approved),
    certOrientation: (row.cert_orientation || undefined) as 'landscape' | 'portrait' | undefined,
    certBgStyle: (row.cert_bg_style || undefined) as 'classic' | 'gold' | 'dark' | 'white' | undefined,
    certFontStyle: (row.cert_font_style || undefined) as 'royal' | 'modern' | 'classic' | undefined,
    certAccentColor: row.cert_accent_color || undefined,
    certCustomTitle: row.cert_custom_title || undefined,
    certHostSignatory: row.cert_host_signatory || undefined,
    certCustomLogoUrl: row.cert_custom_logo_url || undefined,
    certLogoPosition: (row.cert_logo_position || undefined) as 'left' | 'center' | 'right' | undefined,
    certCustomRibbonText: row.cert_custom_ribbon_text || undefined,
    certCustomBodyText: row.cert_custom_body_text || undefined,
    certSignatures: row.cert_signatures || undefined,
    submissionFileUrl: row.submission_file_url || undefined,
    submissionFileName: row.submission_file_name || undefined,
    submissionFileSize: row.submission_file_size || undefined,
    submissionFileType: row.submission_file_type || undefined,
    submissionGithubUrl: row.submission_github_url || undefined,
    submissionNotes: row.submission_notes || undefined,
    submittedAt: row.submitted_at ? new Date(row.submitted_at).toISOString() : undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    certificateStatus: (row.certificate_status || 'NOT_REQUESTED') as CertificateStatus,
    certificateId: row.certificate_id || undefined,
    participationCertificateId: row.participation_certificate_id || undefined,
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
  const adminEmails = ['info@aveeranex.com', 'kvrkkumarphd@gmail.com', 'rajeshkumar.agile@gmail.com'];
  const adminPasswordHash = bcrypt.hashSync('aveeranex@123', 10);

  adminEmails.forEach((email, idx) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      const superAdmin: User = {
        id: `usr_admin_00${idx + 1}`,
        name: 'Dr. Rajesh Kumar (Director)',
        teamName: 'AVEERANEX Leadership',
        email: email,
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
        role: 'super_admin',
        category: 'ADMIN',
        canApproveCertificates: true,
        createdAt: '2026-11-20T10:00:00.000Z',
        certificateStatus: 'APPROVED',
        certificateId: `AVX-2026-NOV-ADMIN${idx > 0 ? idx + 1 : ''}`,
        certificateApprovedAt: '2026-11-22T10:00:00.000Z',
        certificateApprovedBy: 'SUPER_ADMIN',
      };
      users.unshift(superAdmin);
    } else {
      existing.role = 'super_admin';
      existing.category = 'ADMIN';
      existing.canApproveCertificates = true;
    }
  });

  // Ensure all users have category
  users.forEach((u) => {
    if (!u.category) {
      u.category = u.role === 'admin' || u.role === 'super_admin' ? 'ADMIN' : 'PARTICIPANT';
    }
    if (!u.awardLevel && u.category === 'PARTICIPANT') {
      u.awardLevel = 'PARTICIPATION';
    }
  });

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
            team_name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            contact VARCHAR(100) NOT NULL,
            college VARCHAR(255),
            location VARCHAR(255),
            state VARCHAR(255),
            country VARCHAR(100),
            pincode VARCHAR(50),
            topic_title TEXT,
            topic_domain VARCHAR(255),
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
        `);

        // Execute each column addition individually to ensure 100% schema compliance across pools
        const columnMigrations = [
          "ALTER TABLE users ALTER COLUMN team_name DROP NOT NULL",
          "ALTER TABLE users ALTER COLUMN college DROP NOT NULL",
          "ALTER TABLE users ALTER COLUMN location DROP NOT NULL",
          "ALTER TABLE users ALTER COLUMN state DROP NOT NULL",
          "ALTER TABLE users ALTER COLUMN country DROP NOT NULL",
          "ALTER TABLE users ALTER COLUMN pincode DROP NOT NULL",
          "ALTER TABLE users ALTER COLUMN topic_title DROP NOT NULL",
          "ALTER TABLE users ALTER COLUMN topic_domain DROP NOT NULL",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'PARTICIPANT'",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS award_level VARCHAR(50) DEFAULT 'PARTICIPATION'",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS organization VARCHAR(255)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(255)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(255)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS technical_responsibility TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS committee_role VARCHAR(255)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS can_approve_certificates BOOLEAN DEFAULT FALSE",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_event VARCHAR(255)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS event_rounds VARCHAR(100)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS event_dates VARCHAR(255)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS event_prizes TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS event_banner_url TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS event_description TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS event_approved BOOLEAN DEFAULT FALSE",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS cert_orientation VARCHAR(50)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS cert_bg_style VARCHAR(50)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS cert_font_style VARCHAR(50)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS cert_accent_color VARCHAR(50)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS cert_custom_title VARCHAR(255)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS cert_host_signatory VARCHAR(255)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS cert_custom_logo_url TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS cert_logo_position VARCHAR(50)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS cert_custom_ribbon_text VARCHAR(255)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS cert_custom_body_text TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS cert_signatures TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS participation_certificate_id VARCHAR(100)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS award_orientation VARCHAR(50)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS runner_theme VARCHAR(50)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS submission_file_url TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS submission_file_name VARCHAR(255)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS submission_file_size VARCHAR(100)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS submission_file_type VARCHAR(100)",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS submission_github_url TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS submission_notes TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMPTZ",
        ];

        for (const colSql of columnMigrations) {
          try {
            await p.query(colSql);
          } catch (colErr) {
            console.error('Column migration note:', colErr);
          }
        }

        // Check if super admins exist in Postgres (info@aveeranex.com, kvrkkumarphd@gmail.com, rajeshkumar.agile@gmail.com)
        const adminList = [
          { id: 'usr_admin_001', email: 'info@aveeranex.com', certId: 'AVX-2026-NOV-ADMIN' },
          { id: 'usr_admin_002', email: 'kvrkkumarphd@gmail.com', certId: 'AVX-2026-NOV-ADMIN2' },
          { id: 'usr_admin_003', email: 'rajeshkumar.agile@gmail.com', certId: 'AVX-2026-NOV-ADMIN3' },
        ];
        const adminPasswordHash = bcrypt.hashSync('aveeranex@123', 10);

        for (const adm of adminList) {
          await p.query(
            `INSERT INTO users (
               id, name, team_name, email, contact, college, location, state, country, pincode,
               topic_title, topic_domain, presented_on, password_hash, role, category, can_approve_certificates,
               certificate_status, certificate_id, certificate_approved_at, certificate_approved_by, created_at
             ) VALUES (
               $1, 'Dr. Rajesh Kumar (Director)', 'AVEERANEX Leadership', $2,
               '+91 9876543210', 'AVEERANEX Headquarters', 'Bengaluru', 'Karnataka', 'India', '560001',
               'AVEERANEX Innovate Hackathon 2026 Super Admin', 'Leadership & Research',
               'AVEERANEX INNOVATE ONLINE HACKATHON  Nov''26', $3, 'super_admin', 'ADMIN', true, 'APPROVED',
               $4, NOW(), 'SUPER_ADMIN', NOW()
             ) ON CONFLICT (email) DO UPDATE SET
                password_hash = $3,
                role = 'super_admin',
                category = 'ADMIN',
                can_approve_certificates = true`,
            [adm.id, adm.email, adminPasswordHash, adm.certId]
          );
        }

        // Migrate existing rows safely to Participant category without overwriting any data
        await p.query(`
          UPDATE users SET category = 'PARTICIPANT'
          WHERE (category IS NULL OR category = '') AND role = 'user';
          UPDATE users SET award_level = 'PARTICIPATION'
          WHERE (award_level IS NULL OR award_level = '') AND category = 'PARTICIPANT';
        `);

        // Migrate seed users from disk ONLY if not already present in Postgres (never overwrite live DB)
        const diskUsers = loadUsersFromDisk();
        for (const u of diskUsers) {
          if (u.email.toLowerCase() !== 'info@aveeranex.com') {
            await p.query(
              `INSERT INTO users (
                 id, name, team_name, email, contact, college, location, state, country, pincode,
                 topic_title, topic_domain, presented_on, password_hash, role, category, award_level,
                 organization, designation, specialization, technical_responsibility, committee_role,
                 can_approve_certificates, assigned_event,
                 certificate_status, certificate_id, certificate_approved_at, certificate_approved_by, created_at
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
               ON CONFLICT (email) DO NOTHING`,
              [
                u.id,
                u.name,
                u.teamName || null,
                u.email,
                u.contact,
                u.college || null,
                u.location || null,
                u.state || null,
                u.country || null,
                u.pincode || null,
                u.topicTitle || null,
                u.topicDomain || null,
                u.presentedOn,
                u.passwordHash,
                u.role,
                u.category || 'PARTICIPANT',
                u.awardLevel || 'PARTICIPATION',
                u.organization || null,
                u.designation || null,
                u.specialization || null,
                u.technicalResponsibility || null,
                u.committeeRole || null,
                Boolean(u.canApproveCertificates),
                u.assignedEvent || null,
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
        'SELECT * FROM users WHERE UPPER(certificate_id) = $1 OR UPPER(participation_certificate_id) = $1 LIMIT 1',
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
  return memoryUsers.find(
    (u) =>
      u.certificateId?.toUpperCase() === normalized ||
      u.participationCertificateId?.toUpperCase() === normalized
  );
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
    category: userData.category || 'PARTICIPANT',
    awardLevel: userData.awardLevel || 'PARTICIPATION',
  };

  const p = getPool();
  if (p) {
    try {
      await p.query(
        `INSERT INTO users (
           id, name, team_name, email, contact, college, location, state, country, pincode,
           topic_title, topic_domain, presented_on, password_hash, role, category, award_level,
           organization, designation, specialization, technical_responsibility, committee_role,
           linkedin_url, can_approve_certificates, assigned_event,
           event_rounds, event_dates, event_prizes, event_banner_url, event_description, event_approved,
           created_at, certificate_status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
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
           presented_on = EXCLUDED.presented_on,
           category = EXCLUDED.category,
           organization = EXCLUDED.organization,
           designation = EXCLUDED.designation,
           specialization = EXCLUDED.specialization,
           technical_responsibility = EXCLUDED.technical_responsibility,
           committee_role = EXCLUDED.committee_role,
           linkedin_url = EXCLUDED.linkedin_url,
           assigned_event = EXCLUDED.assigned_event,
           event_rounds = EXCLUDED.event_rounds,
           event_dates = EXCLUDED.event_dates,
           event_prizes = EXCLUDED.event_prizes,
           event_banner_url = EXCLUDED.event_banner_url,
           event_description = EXCLUDED.event_description,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            award_level = EXCLUDED.award_level,
            event_approved = EXCLUDED.event_approved,
            can_approve_certificates = EXCLUDED.can_approve_certificates`,
        [
          newUser.id,
          newUser.name,
          newUser.teamName || null,
          newUser.email,
          newUser.contact,
          newUser.college || null,
          newUser.location || null,
          newUser.state || null,
          newUser.country || null,
          newUser.pincode || null,
          newUser.topicTitle || null,
          newUser.topicDomain || null,
          newUser.presentedOn,
          newUser.passwordHash,
          newUser.role,
          newUser.category,
          newUser.awardLevel || 'PARTICIPATION',
          newUser.organization || null,
          newUser.designation || null,
          newUser.specialization || null,
          newUser.technicalResponsibility || null,
          newUser.committeeRole || null,
          newUser.linkedinUrl || null,
          Boolean(newUser.canApproveCertificates),
          newUser.assignedEvent || null,
          newUser.eventRounds || null,
          newUser.eventDates || null,
          newUser.eventPrizes || null,
          newUser.eventBannerUrl || null,
          newUser.eventDescription || null,
          Boolean(newUser.eventApproved),
          newUser.createdAt,
          newUser.certificateStatus,
        ]
      );
    } catch (err: any) {
      console.error('Postgres createUser error:', err);
      throw new Error('Database write error: ' + (err?.message || 'Database insert failed'));
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
           name = $1,
           team_name = $2,
           contact = $3,
           college = $4,
           location = $5,
           state = $6,
           topic_title = $7,
           topic_domain = $8,
           presented_on = $9,
           role = $10,
           category = $11,
           award_level = $12,
           organization = $13,
           designation = $14,
           specialization = $15,
           technical_responsibility = $16,
           committee_role = $17,
           can_approve_certificates = $18,
           assigned_event = $19,
           submission_file_url = $20,
           submission_file_name = $21,
           submission_file_size = $22,
           submission_file_type = $23,
           submission_github_url = $24,
           submission_notes = $25,
           submitted_at = $26,
           certificate_status = $27,
           certificate_id = $28,
           certificate_approved_at = $29,
           certificate_approved_by = $30,
           rejection_reason = $31,
           password_hash = $32,
           reset_password_token = $33,
           reset_password_expires = $34,
           event_rounds = $35,
           event_dates = $36,
           event_prizes = $37,
           event_banner_url = $38,
           event_description = $39,
           event_approved = $40,
           cert_orientation = $41,
           cert_bg_style = $42,
           cert_font_style = $43,
           cert_accent_color = $44,
           cert_custom_title = $45,
           cert_host_signatory = $46,
           cert_custom_logo_url = $47,
           cert_logo_position = $48,
           cert_custom_ribbon_text = $49,
           cert_custom_body_text = $50,
           cert_signatures = $51,
           participation_certificate_id = $52,
           award_orientation = $53,
           runner_theme = $54
         WHERE id = $55`,
        [
          merged.name,
          merged.teamName || null,
          merged.contact,
          merged.college || null,
          merged.location || null,
          merged.state || null,
          merged.topicTitle || null,
          merged.topicDomain || null,
          merged.presentedOn,
          merged.role,
          merged.category,
          merged.awardLevel || 'PARTICIPATION',
          merged.organization || null,
          merged.designation || null,
          merged.specialization || null,
          merged.technicalResponsibility || null,
          merged.committeeRole || null,
          Boolean(merged.canApproveCertificates),
          merged.assignedEvent || null,
          merged.submissionFileUrl || null,
          merged.submissionFileName || null,
          merged.submissionFileSize || null,
          merged.submissionFileType || null,
          merged.submissionGithubUrl || null,
          merged.submissionNotes || null,
          merged.submittedAt || null,
          merged.certificateStatus,
          merged.certificateId || null,
          merged.certificateApprovedAt || null,
          merged.certificateApprovedBy || null,
          merged.rejectionReason || null,
          merged.passwordHash,
          merged.resetPasswordToken || null,
          merged.resetPasswordExpires || null,
          merged.eventRounds || null,
          merged.eventDates || null,
          merged.eventPrizes || null,
          merged.eventBannerUrl || null,
          merged.eventDescription || null,
          Boolean(merged.eventApproved),
          merged.certOrientation || null,
          merged.certBgStyle || null,
          merged.certFontStyle || null,
          merged.certAccentColor || null,
          merged.certCustomTitle || null,
          merged.certHostSignatory || null,
          merged.certCustomLogoUrl || null,
          merged.certLogoPosition || null,
          merged.certCustomRibbonText || null,
          merged.certCustomBodyText || null,
          merged.certSignatures || null,
          merged.participationCertificateId || null,
          merged.awardOrientation || null,
          merged.runnerTheme || null,
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

export async function approveCertificate(
  userId: string,
  adminName: string,
  awardLevel?: AwardLevel,
  includeParticipationToo: boolean = true,
  awardOrientation?: 'landscape' | 'portrait',
  runnerTheme?: 'white' | 'black'
): Promise<User | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const partSuffix = Math.floor(1000 + Math.random() * 9000);
  let certIdPrefix = 'AVX-2026-NOV';

  const category = user.category || 'PARTICIPANT';
  const finalAward = awardLevel || user.awardLevel || 'PARTICIPATION';

  if (category === 'MENTOR_JURY') {
    certIdPrefix = 'AVX-MJ-2026';
  } else if (category === 'TECHNICAL_COORDINATOR') {
    certIdPrefix = 'AVX-TC-2026';
  } else if (category === 'EVENT_COORDINATOR') {
    certIdPrefix = 'AVX-EC-2026';
  } else if (category === 'ADMIN') {
    certIdPrefix = 'AVX-ADM-2026';
  } else if (category === 'PARTICIPANT') {
    if (finalAward === 'WINNER_1ST') certIdPrefix = 'AVX-WIN1-2026';
    else if (finalAward === 'WINNER_2ND') certIdPrefix = 'AVX-WIN2-2026';
    else if (finalAward === 'WINNER_3RD') certIdPrefix = 'AVX-WIN3-2026';
    else if (finalAward === 'RUNNER_4TH') certIdPrefix = 'AVX-RUN4-2026';
    else if (finalAward === 'RUNNER_5TH') certIdPrefix = 'AVX-RUN5-2026';
  }

  // If upgrading a participant to a Winner/Runner award, ensure certId uses the winner/runner prefix
  const hasMatchingPrefix = user.certificateId?.startsWith(certIdPrefix);
  const certId = hasMatchingPrefix && user.certificateId ? user.certificateId : `${certIdPrefix}-${randomSuffix}`;

  // Dual certificate support: if Winner/Runner AND includeParticipationToo is true, also issue Participation ID
  let participationCertId = user.participationCertificateId;
  if (category === 'PARTICIPANT' && finalAward !== 'PARTICIPATION' && includeParticipationToo) {
    if (!participationCertId) {
      participationCertId =
        user.certificateId && user.certificateId.startsWith('AVX-2026-NOV')
          ? user.certificateId
          : `AVX-2026-NOV-${partSuffix}`;
    }
  } else if (!includeParticipationToo) {
    participationCertId = undefined;
  }

  const updated = await updateUser(userId, {
    certificateStatus: 'APPROVED',
    certificateId: certId,
    participationCertificateId: participationCertId,
    awardLevel: finalAward,
    awardOrientation: awardOrientation || user.awardOrientation || 'landscape',
    runnerTheme: runnerTheme || user.runnerTheme || 'white',
    certificateApprovedAt: new Date().toISOString(),
    certificateApprovedBy: adminName || 'Dr. Rajesh Kumar (Director)',
    rejectionReason: undefined,
  });

  return updated;
}

export async function rejectCertificate(userId: string, reason: string): Promise<User | null> {
  return updateUser(userId, {
    certificateStatus: 'REJECTED',
    rejectionReason: reason || 'Details did not match criteria.',
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
