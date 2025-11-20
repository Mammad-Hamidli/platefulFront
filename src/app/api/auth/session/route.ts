import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/lib/env';
import type { AuthSession } from '@/types/auth';
import { applyClaimsToUser, buildAuthUser, buildUserFromClaims } from '@/lib/auth';
import { parseJwt } from '@/lib/token';

export async function GET() {
  const token = cookies().get('token')?.value;

  if (!token) {
    const session: AuthSession = { token: null, user: null };
    return NextResponse.json(session);
  }

  const profileResponse = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  }).catch((error) => {
    console.error('[Auth] profile fetch failed', error);
    return undefined;
  });

  if (!profileResponse || !profileResponse.ok) {
    const response = NextResponse.json<AuthSession>({ token: null, user: null }, { status: 200 });
    response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
    response.cookies.set('role', '', { path: '/', maxAge: 0 });
    return response;
  }

  const rawUser = await profileResponse.json();
  const claims = parseJwt(token);
  let user = buildAuthUser(rawUser, claims) ?? buildUserFromClaims(claims) ?? null;

  if (user) {
    applyClaimsToUser(user, claims);
  }

  const session: AuthSession = { token, user };

  if (!user) {
    const response = NextResponse.json<AuthSession>({ token: null, user: null }, { status: 200 });
    response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
    response.cookies.set('role', '', { path: '/', maxAge: 0 });
    return response;
  }

  const response = NextResponse.json(session);
  response.cookies.set('role', user.role, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return response;
}

