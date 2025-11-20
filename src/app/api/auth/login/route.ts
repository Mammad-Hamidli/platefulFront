import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/lib/env';
import type { AuthSession, AuthUser } from '@/types/auth';
import { applyClaimsToUser, buildAuthUser, buildUserFromClaims } from '@/lib/auth';
import { parseJwt } from '@/lib/token';

interface LoginPayload {
  email: string;
  password: string;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

const extractAuthResponse = (data: any): AuthSession => {
  const token: string | undefined =
    data?.token ?? data?.accessToken ?? data?.jwt ?? data?.access_token;

  const claims = parseJwt(token);
  let user: AuthUser | undefined = buildAuthUser(data?.user, claims);

  if (!user) {
    user = buildAuthUser(data, claims);
  }

  if (!user) {
    user = buildUserFromClaims(claims);
  }

  if (!token || !user) {
    throw new Error('Invalid authentication response from backend');
  }

  applyClaimsToUser(user, claims);

  return { token, user };
};

export async function POST(request: Request) {
  const payload: LoginPayload = await request.json();

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    return NextResponse.json(
      { message: errorBody?.message ?? 'Login failed' },
      { status: response.status }
    );
  }

  const data = await response.json();
  let session: AuthSession;

  try {
    session = extractAuthResponse(data);
  } catch (error) {
    console.error('[Auth] Unable to parse login response', error);
    return NextResponse.json(
      { message: 'Unexpected login response from backend' },
      { status: 500 }
    );
  }

  if (!session.user || !session.token) {
    return NextResponse.json(
      { message: 'Unable to determine user role' },
      { status: 500 }
    );
  }

  if (session.user.role === 'ROLE_WAITER') {
    return NextResponse.json(
      { message: 'Login restricted for this role' },
      { status: 403 }
    );
  }

  const cookieStore = cookies();
  cookieStore.set('token', session.token, cookieOptions);
  cookieStore.set('role', session.user.role, { ...cookieOptions, httpOnly: false });

  return NextResponse.json(session);
}

