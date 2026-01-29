import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const admins = await prisma.admin.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationName: true,
        online: true,
        restrictions: true
      }
    });

    return NextResponse.json({
      success: true,
      count: admins.length,
      admins: admins
    });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admins',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
