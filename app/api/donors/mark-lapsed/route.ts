import { NextResponse } from 'next/server';
import { prisma, getAdminIdFromRequest, getAdminOrganization, verifyPermission } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'donors', 'update');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }
    
    // Get admin organization
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    const { monthsThreshold = 12 } = await request.json();

    // Calculate the date threshold (e.g., 12 months ago)
    const thresholdDate = new Date();
    thresholdDate.setMonth(thresholdDate.getMonth() - monthsThreshold);

    // Find all active donors who haven't donated since the threshold date
    const lapsedonors = await prisma.donor.findMany({
      where: {
        organizationName,
        status: 'Active',
        OR: [
          { lastDonation: { lt: thresholdDate } },
          { lastDonation: null }
        ]
      }
    });

    // Update their status to "Lapsed"
    const updateResult = await prisma.donor.updateMany({
      where: {
        organizationName,
        status: 'Active',
        OR: [
          { lastDonation: { lt: thresholdDate } },
          { lastDonation: null }
        ]
      },
      data: {
        status: 'Lapsed'
      }
    });

    return NextResponse.json({
      message: `${updateResult.count} donors marked as lapsed`,
      count: updateResult.count,
      lapsedonors: lapsedonors.map(d => ({ id: d.id, name: d.name, lastDonation: d.lastDonation }))
    });
  } catch (error) {
    console.error('Mark lapsed error:', error);
    return NextResponse.json(
      { error: 'Failed to mark lapsed donors', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
