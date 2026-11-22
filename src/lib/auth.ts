import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { User, PublicParticipantInfo } from './types';
import { getUserById } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'aveeranex-hackathon-super-secret-key-2026-prod';

export function signToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      teamName: user.teamName,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { userId: string; email: string; role: string; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return null;
  }
}

export async function getAuthUserFromRequest(request: NextRequest): Promise<User | null> {
  // Check cookie
  const tokenFromCookie = request.cookies.get('avx_token')?.value;
  // Check authorization header
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const token = tokenFromCookie || tokenFromHeader;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) return null;

  const user = await getUserById(decoded.userId);
  return user || null;
}

export function toPublicUser(user: User): PublicParticipantInfo {
  const { passwordHash, ...publicData } = user;
  return publicData;
}
