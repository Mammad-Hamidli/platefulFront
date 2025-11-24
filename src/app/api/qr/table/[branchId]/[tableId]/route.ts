import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/env';

export async function GET(
  request: Request,
  { params }: { params: { branchId: string; tableId: string } }
) {
  try {
    const { branchId, tableId } = params;

    if (!branchId || !tableId) {
      return NextResponse.json(
        { message: 'branchId and tableId are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/qr/table/${branchId}/${tableId}`,
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
        { message: errorBody?.message ?? 'Failed to generate QR code' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[QR] Generate error', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

