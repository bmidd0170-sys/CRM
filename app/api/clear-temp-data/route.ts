import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { fullClear = false } = data;

    // If fullClear is requested, delete all data from the database
    if (fullClear) {
      const { prisma } = await import('@/lib/db');
      
      await prisma.$transaction([
        prisma.donation.deleteMany({}),
        prisma.event.deleteMany({}),
        prisma.campaign.deleteMany({}),
        prisma.notification.deleteMany({}),
        prisma.donor.deleteMany({}),
        prisma.admin.deleteMany({})
      ]);
      
      return NextResponse.json({
        message: 'All data cleared successfully',
        success: true,
        fullClear: true
      });
    }

    // Otherwise just signal cache clearing for client-side
    return NextResponse.json({
      message: 'Temporary data cleared successfully',
      success: true
    });
  } catch (error) {
    console.error('Error clearing temporary data:', error);
    return NextResponse.json(
      {
        error: 'Failed to clear temporary data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
