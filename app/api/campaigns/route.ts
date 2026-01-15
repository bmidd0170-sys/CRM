import { NextResponse } from 'next/server';
import { prisma, checkIsSuperAdmin, getAdminIdFromRequest } from '@/lib/db';
import { campaignSchema, validateData, formatValidationErrors } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Get single campaign by ID
    if (id) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: parseInt(id) },
        include: { events: true, donations: true }
      });

      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      return NextResponse.json(campaign);
    }

    // Get all campaigns
    const campaigns = await prisma.campaign.findMany({
      include: { events: true, donations: true },
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Campaign fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate input data
    const validation = validateData(campaignSchema, data);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    // Prepare data for creation
    const campaignData = {
      ...validation.data,
      startDate: new Date(validation.data.startDate),
      endDate: new Date(validation.data.endDate)
    };

    // Create campaign
    const newCampaign = await prisma.campaign.create({
      data: campaignData,
      include: { events: true, donations: true }
    });

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error('Campaign create error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    // Validate input data
    const validation = validateData(campaignSchema.partial(), updateData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Prepare update data
    const campaignUpdateData = {
      ...validation.data,
      startDate: validation.data.startDate ? new Date(validation.data.startDate) : undefined,
      endDate: validation.data.endDate ? new Date(validation.data.endDate) : undefined
    };

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id: parseInt(id) },
      data: campaignUpdateData,
      include: { events: true, donations: true }
    });

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error('Campaign update error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    // Check if admin is logged in and is a Super Admin
    const adminId = getAdminIdFromRequest(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const isSuperAdmin = await checkIsSuperAdmin(adminId);
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden: Only Super Admins can delete campaigns' }, { status: 403 });
    }

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Delete campaign (will cascade delete related donations and events if configured)
    await prisma.campaign.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Campaign delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
