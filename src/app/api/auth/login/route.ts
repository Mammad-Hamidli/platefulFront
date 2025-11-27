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

  if (!token) {
    console.error('[Auth] No token found in response. Response keys:', Object.keys(data || {}));
    console.error('[Auth] Response data:', JSON.stringify(data, null, 2));
    throw new Error('No authentication token found in backend response');
  }

  let claims;
  try {
    claims = parseJwt(token);
  } catch (error) {
    console.error('[Auth] Failed to parse JWT token:', error);
    throw new Error('Invalid JWT token format');
  }

  let user: AuthUser | undefined = buildAuthUser(data?.user, claims);

  if (!user) {
    user = buildAuthUser(data, claims);
  }

  if (!user) {
    user = buildUserFromClaims(claims);
  }

  if (!user) {
    console.error('[Auth] Unable to build user from response. Response data:', JSON.stringify(data, null, 2));
    console.error('[Auth] JWT claims:', JSON.stringify(claims, null, 2));
    throw new Error('Unable to extract user information from backend response');
  }

  applyClaimsToUser(user, claims);

  return { token, user };
};

export async function POST(request: Request) {
  const payload: LoginPayload = await request.json();
  const loginUrl = `${API_BASE_URL}/auth/login`;

  console.log('[Auth] Attempting login to:', loginUrl);
  console.log('[Auth] Login payload:', { email: payload.email, password: '***' });

  let response: Response;
  try {
    response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('[Auth] Network error connecting to backend:', error);
    return NextResponse.json(
      { message: `Cannot connect to backend server at ${loginUrl}. Please ensure the backend is running.` },
      { status: 503 }
    );
  }

  console.log('[Auth] Backend response status:', response.status);

  if (response.status === 401) {
    const errorBody = await response.json().catch(() => ({}));
    console.error('[Auth] Authentication failed (401):', errorBody);
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error('[Auth] Backend error response:', {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    });
    return NextResponse.json(
      { message: errorBody?.message ?? `Login failed: ${response.statusText}` },
      { status: response.status }
    );
  }

  const data = await response.json();
  console.log('[Auth] Backend response received. Keys:', Object.keys(data || {}));
  
  let session: AuthSession;

  try {
    session = extractAuthResponse(data);
  } catch (error) {
    console.error('[Auth] Unable to parse login response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unexpected login response from backend';
    return NextResponse.json(
      { message: errorMessage },
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

