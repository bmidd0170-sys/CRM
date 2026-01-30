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

    // Get all donors in this organization
    const donors = await prisma.donor.findMany({
      where: { organizationName },
      include: { donations: { orderBy: { date: 'desc' } } }
    });

    let updatedCount = 0;

    // Update each donor's information based on their donations
    for (const donor of donors) {
      // Calculate total from donations
      const totalDonated = donor.donations.reduce((sum, d) => sum + d.amount, 0);
      
      // Get last donation date
      const lastDonation = donor.donations.length > 0 ? donor.donations[0].date : null;

      // Check if any field needs updating
      if (donor.total !== totalDonated || donor.lastDonation !== lastDonation) {
        await prisma.donor.update({
          where: { id: donor.id },
          data: {
            total: totalDonated,
            lastDonation: lastDonation
          }
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      message: `Synced ${updatedCount} donors`,
      updatedCount,
      totalDonors: donors.length
    });
  } catch (error) {
    console.error('Donor sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync donors', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
