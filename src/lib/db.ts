import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, CertificateStatus } from './types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// In-memory cache
let memoryUsers: User[] = [];
let initialized = false;

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

export function initializeDatabase() {
  if (initialized) return;

  let users = loadUsersFromDisk();

  // Check if super admin exists
  const adminEmail = 'admin@aveeranex.com';
  const existingAdmin = users.find((u) => u.email.toLowerCase() === adminEmail);

  if (!existingAdmin) {
    const adminPasswordHash = bcrypt.hashSync('Admin@Aveeranex2026!', 10);
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
