import { NextResponse } from 'next/server';
import { prisma, getAdminIdFromRequest } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const adminId = getAdminIdFromRequest(request);

    console.log('[Debug] Admin ID from request:', adminId);

    if (!adminId) {
      return NextResponse.json({
        authenticated: false,
        message: 'No admin ID found in request headers',
        adminId: null
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        restrictions: true
      }
    });

    if (!admin) {
      return NextResponse.json({
        authenticated: false,
        message: 'Admin ID in header but admin not found in database',
        adminId: adminId
      });
    }

    return NextResponse.json({
      authenticated: true,
      admin: admin,
      message: 'Admin authenticated successfully'
    });
  } catch (error) {
    console.error('[Debug] Error:', error);
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
