import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Pool } from '@neondatabase/serverless';
import { User, CertificateStatus } from './types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// In-memory cache
let memoryUsers: User[] = [];
let initialized = false;

// Postgres connection if configured
const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
let pool: Pool | null = null;

if (postgresUrl) {
  try {
    pool = new Pool({ connectionString: postgresUrl });
  } catch (err) {
    console.error('Error creating Postgres pool:', err);
  }
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

// Auto-create table in Postgres if connected
async function initPostgresTable() {
  if (!pool) return;
  try {
    await pool.query(`
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
        rejection_reason TEXT
      );
    `);
  } catch (err) {
    console.error('Error initializing Postgres table:', err);
  }
}

export function initializeDatabase() {
  if (initialized) return;

  let users = loadUsersFromDisk();

  // Check if super admin exists
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
    users.push(superAdmin);
  }

  // Pre-seed sample participants if database is new
  const sampleUserEmail = 'innovator@aveeranex.com';
  if (!users.find((u) => u.email.toLowerCase() === sampleUserEmail)) {
    const userPasswordHash = bcrypt.hashSync('Hackathon@2026', 10);
    const sampleUser: User = {
      id: 'usr_part_001',
      name: 'Aditya Sharma',
      teamName: 'Neural Nexians',
      email: sampleUserEmail,
      contact: '+91 9845012345',
      college: 'Indian Institute of Technology (IIT)',
      location: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560012',
      topicTitle: 'Autonomous Edge AI for Medical Diagnostics',
      topicDomain: 'AI / Machine Learning',
      presentedOn: "AVEERANEX INNOVATE ONLINE HACKATHON  Nov'26",
      passwordHash: userPasswordHash,
      role: 'user',
      createdAt: '2026-11-21T09:30:00.000Z',
      certificateStatus: 'APPROVED',
      certificateId: 'AVX-2026-NOV-9841',
      certificateApprovedAt: '2026-11-22T11:15:00.000Z',
      certificateApprovedBy: 'Dr. Rajesh Kumar',
    };

    const pendingUser: User = {
      id: 'usr_part_002',
      name: 'Priya Sundaram',
      teamName: 'Quantum Coders',
      email: 'priya.s@university.edu',
      contact: '+91 9765432109',
      college: 'National Institute of Technology (NIT)',
      location: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '600025',
      topicTitle: 'Decentralized Zero-Knowledge Verification Platform',
      topicDomain: 'Web3 / Blockchain',
      presentedOn: "AVEERANEX INNOVATE ONLINE HACKATHON  Nov'26",
      passwordHash: userPasswordHash,
      role: 'user',
      createdAt: '2026-11-22T08:20:00.000Z',
      certificateStatus: 'PENDING_APPROVAL',
    };

    users.push(sampleUser, pendingUser);
  }

  memoryUsers = users;
  saveUsersToDisk(users);

  if (pool) {
    initPostgresTable().catch((e) => console.error(e));
  }

  initialized = true;
}

export function getAllUsers(): User[] {
  initializeDatabase();
  return memoryUsers;
}

export function getUserByEmail(email: string): User | undefined {
  initializeDatabase();
  return memoryUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function getUserById(id: string): User | undefined {
  initializeDatabase();
  return memoryUsers.find((u) => u.id === id);
}

export function getUserByCertificateId(certId: string): User | undefined {
  initializeDatabase();
  const normalized = certId.trim().toUpperCase();
  return memoryUsers.find((u) => u.certificateId?.toUpperCase() === normalized);
}

export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'certificateStatus'>): User {
  initializeDatabase();
  const newUser: User = {
    ...userData,
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    certificateStatus: 'NOT_REQUESTED',
  };

  memoryUsers.push(newUser);
  saveUsersToDisk(memoryUsers);

  // If Postgres is connected, save asynchronously
  if (pool) {
    pool.query(
      `INSERT INTO users (id, name, team_name, email, contact, college, location, state, country, pincode, topic_title, topic_domain, presented_on, password_hash, role, certificate_status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (email) DO NOTHING`,
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
        newUser.certificateStatus,
        newUser.createdAt,
      ]
    ).catch((err) => console.error('Postgres insert error:', err));
  }

  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  initializeDatabase();
  const index = memoryUsers.findIndex((u) => u.id === id);
  if (index === -1) return null;

  memoryUsers[index] = {
    ...memoryUsers[index],
    ...updates,
  };

  saveUsersToDisk(memoryUsers);

  // If Postgres is connected, update row
  if (pool) {
    const u = memoryUsers[index];
    pool.query(
      `UPDATE users SET
         certificate_status = $1,
         certificate_id = $2,
         certificate_approved_at = $3,
         certificate_approved_by = $4,
         rejection_reason = $5
       WHERE id = $6`,
      [
        u.certificateStatus,
        u.certificateId || null,
        u.certificateApprovedAt || null,
        u.certificateApprovedBy || null,
        u.rejectionReason || null,
        id,
      ]
    ).catch((err) => console.error('Postgres update error:', err));
  }

  return memoryUsers[index];
}

export function requestCertificate(userId: string): User | null {
  return updateUser(userId, {
    certificateStatus: 'PENDING_APPROVAL',
  });
}

export function approveCertificate(userId: string, adminName: string): User | null {
  initializeDatabase();
  const user = getUserById(userId);
  if (!user) return null;

  // Generate unique certificate ID
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const certId = user.certificateId || `AVX-2026-NOV-${randomSuffix}`;

  return updateUser(userId, {
    certificateStatus: 'APPROVED',
    certificateId: certId,
    certificateApprovedAt: new Date().toISOString(),
    certificateApprovedBy: adminName || 'Dr. Rajesh Kumar (Director)',
    rejectionReason: undefined,
  });
}

export function rejectCertificate(userId: string, reason: string): User | null {
  return updateUser(userId, {
    certificateStatus: 'REJECTED',
    rejectionReason: reason || 'Details did not match hackathon submission criteria.',
  });
}
