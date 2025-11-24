import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/env';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const response = await fetch(`${API_BASE_URL}/customer/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorBody?.message ?? 'Failed to create order' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[CustomerOrder] Create error', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

