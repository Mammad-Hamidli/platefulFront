import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/env';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const tableId = searchParams.get('tableId');

    if (!branchId || !tableId) {
      return NextResponse.json(
        { message: 'branchId and tableId are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/customer/menu?branchId=${branchId}&tableId=${tableId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorBody?.message ?? 'Failed to fetch menu' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[CustomerMenu] Fetch error', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

