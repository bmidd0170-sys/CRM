import { NextResponse } from 'next/server';
import { prisma, checkCampaignExists, checkDonorExists, updateDonorTotal, updateCampaignRaised, getAdminIdFromRequest, getAdminOrganization, verifyPermission } from '@/lib/db';
import { donationSchema, validateData, formatValidationErrors } from '@/lib/validators';
import { createNotification } from '@/lib/notification-helper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const donorId = searchParams.get('donorId');
    const campaignId = searchParams.get('campaignId');
    
    // Get admin organization
    const adminId = getAdminIdFromRequest(request);
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    // Get single donation by ID
    if (id) {
      const donation = await prisma.donation.findFirst({
        where: { 
          id: parseInt(id),
          organizationName
        },
        include: { donor: true, campaign: true }
      });

      if (!donation) {
        return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
      }

      return NextResponse.json(donation);
    }

    // Build filter conditions
    const where: any = { organizationName };
    if (donorId) where.donorId = parseInt(donorId);
    if (campaignId) where.campaignId = parseInt(campaignId);

    // Get donations with optional filters
    const donations = await prisma.donation.findMany({
      where,
      include: { donor: true, campaign: true },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(donations);
  } catch (error) {
    console.error('Donation fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'donations', 'create');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }
    
    // Get admin organization
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    const data = await request.json();

    // Validate input data
    const validation = validateData(donationSchema, data);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    // Verify donor exists
    const donorExists = await checkDonorExists(validation.data.donorId);
    if (!donorExists) {
      return NextResponse.json(
        { error: 'Donor not found' },
        { status: 404 }
      );
    }

    // Verify campaign exists if campaignId is provided
    if (validation.data.campaignId) {
      const campaignExists = await checkCampaignExists(validation.data.campaignId);
      if (!campaignExists) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
    }

    // Prepare data for creation
    const donationData = {
      ...validation.data,
      date: new Date(validation.data.date),
      organizationName
    };

    // Create donation in a transaction
    const newDonation = await prisma.$transaction(async (tx) => {
      // Create the donation
      const donation = await tx.donation.create({
        data: donationData,
        include: { donor: true, campaign: true }
      });

      // Update donor total and last donation date
      const donorTotal = await tx.donation.aggregate({
        where: { donorId: validation.data.donorId },
        _sum: { amount: true }
      });

      await tx.donor.update({
        where: { id: validation.data.donorId },
        data: {
          total: donorTotal._sum.amount || 0,
          lastDonation: donationData.date,
          lastContacted: new Date(),
          status: 'Active'
        }
      });

      // Update campaign raised amount if applicable
      if (validation.data.campaignId) {
        const campaignTotal = await tx.donation.aggregate({
          where: { campaignId: validation.data.campaignId },
          _sum: { amount: true }
        });

        await tx.campaign.update({
          where: { id: validation.data.campaignId },
          data: { raised: campaignTotal._sum.amount || 0 }
        });
      }

      return donation;
    });

    // Create notification
    await createNotification({
      type: 'admin',
      message: `New donation of $${newDonation.amount} recorded from ${newDonation.donor.name}`,
      organizationName,
      adminId
    });

    return NextResponse.json(newDonation, { status: 201 });
  } catch (error) {
    console.error('Donation create error:', error);
    return NextResponse.json(
      { error: 'Failed to create donation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'donations', 'update');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }
    
    // Get admin organization
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
    }

    // Validate input data
    const validation = validateData(donationSchema.partial(), updateData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    // Check if donation exists in this organization
    const existingDonation = await prisma.donation.findFirst({
      where: { 
        id: parseInt(id),
        organizationName
      }
    });

    if (!existingDonation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    // Verify donor exists if donorId is being updated
    if (validation.data.donorId) {
      const donorExists = await checkDonorExists(validation.data.donorId);
      if (!donorExists) {
        return NextResponse.json(
          { error: 'Donor not found' },
          { status: 404 }
        );
      }
    }

    // Verify campaign exists if campaignId is being updated
    if (validation.data.campaignId) {
      const campaignExists = await checkCampaignExists(validation.data.campaignId);
      if (!campaignExists) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
    }

    // Prepare update data
    const donationUpdateData = {
      ...validation.data,
      date: validation.data.date ? new Date(validation.data.date) : undefined
    };

    // Update donation in a transaction
    const updatedDonation = await prisma.$transaction(async (tx) => {
      // Update the donation
      const donation = await tx.donation.update({
        where: { id: parseInt(id) },
        data: donationUpdateData,
        include: { donor: true, campaign: true }
      });

      // Recalculate donor totals if donor changed or amount changed
      const affectedDonorIds = new Set([existingDonation.donorId]);
      if (validation.data.donorId && validation.data.donorId !== existingDonation.donorId) {
        affectedDonorIds.add(validation.data.donorId);
      }

      for (const donorId of affectedDonorIds) {
        await updateDonorTotal(donorId);
      }

      // Recalculate campaign totals if campaign changed or amount changed
      const affectedCampaignIds = new Set<number>();
      if (existingDonation.campaignId) affectedCampaignIds.add(existingDonation.campaignId);
      if (validation.data.campaignId) affectedCampaignIds.add(validation.data.campaignId);

      for (const campaignId of affectedCampaignIds) {
        await updateCampaignRaised(campaignId);
      }

      return donation;
    });

    // Create notification
    await createNotification({
      type: 'admin',
      message: `Donation of $${updatedDonation.amount} updated`,
      organizationName,
      adminId
    });

    return NextResponse.json(updatedDonation);
  } catch (error) {
    console.error('Donation update error:', error);
    return NextResponse.json(
      { error: 'Failed to update donation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
    }

    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'donations', 'delete');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }
    
    // Get admin organization
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    // Check if donation exists in this organization
    const existingDonation = await prisma.donation.findFirst({
      where: { 
        id: parseInt(id),
        organizationName
      }
    });

    if (!existingDonation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    // Delete donation and update related totals
    await prisma.$transaction(async (tx) => {
      // Delete the donation
      await tx.donation.delete({
        where: { id: parseInt(id) }
      });

      // Update donor total
      await updateDonorTotal(existingDonation.donorId);

      // Update campaign raised amount if applicable
      if (existingDonation.campaignId) {
        await updateCampaignRaised(existingDonation.campaignId);
      }
    });

    // Create notification
    await createNotification({
      type: 'admin',
      message: `Donation of $${existingDonation.amount} deleted`,
      organizationName,
      adminId
    });

    return NextResponse.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Donation delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete donation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
