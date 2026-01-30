import { NextResponse } from 'next/server';
import { prisma, getAdminIdFromRequest, getAdminOrganization, verifyPermission } from '@/lib/db';
import { campaignSchema, validateData, formatValidationErrors } from '@/lib/validators';
import { createNotification } from '@/lib/notification-helper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Get admin organization
    const adminId = getAdminIdFromRequest(request);
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    // Get single campaign by ID
    if (id) {
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id: parseInt(id),
          organizationName
        },
        include: { events: true, donations: true }
      });

      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      return NextResponse.json(campaign);
    }

    // Get all campaigns for this organization
    const campaigns = await prisma.campaign.findMany({
      where: { organizationName },
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
  console.log('========== CAMPAIGNS POST REQUEST RECEIVED ==========');
  try {
    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    console.log('[Campaigns API] Admin ID from request:', adminId);
    const permission = await verifyPermission(adminId, 'campaigns', 'create');
    console.log('[Campaigns API] Permission result:', permission);
    if (!permission.authorized) {
      console.error('[Campaigns API] Permission denied:', permission.error);
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }
    console.log('[Campaigns API] Permission granted');
    
    // Get admin organization
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    const data = await request.json();
    console.log('[Campaigns API] Received data:', JSON.stringify(data, null, 2));
    console.log('[Campaigns API] Description field:', {
      exists: 'description' in data,
      value: data.description,
      type: typeof data.description,
      length: data.description?.length
    });

    // Validate input data
    const validation = validateData(campaignSchema, data);
    console.log('[Campaigns API] Validation result:', {
      success: validation.success,
      error: validation.error,
      data: validation.data
    });
    if (!validation.success) {
      console.error('[Campaigns API] Validation failed:', formatValidationErrors(validation.error));
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
      endDate: new Date(validation.data.endDate),
      organizationName
    };

    // Create campaign
    const newCampaign = await prisma.campaign.create({
      data: campaignData,
      include: { events: true, donations: true }
    });

    // Create notification
    await createNotification({
      type: 'admin',
      message: `New campaign created: ${newCampaign.name}`,
      organizationName,
      adminId
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
    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'campaigns', 'update');
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

    // Check if campaign exists in this organization
    const existingCampaign = await prisma.campaign.findFirst({
      where: { 
        id: parseInt(id),
        organizationName
      }
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

    // Create notification
    await createNotification({
      type: 'admin',
      message: `Campaign updated: ${updatedCampaign.name}`,
      organizationName,
      adminId
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

    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'campaigns', 'delete');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }
    
    // Get admin organization
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    // Check if campaign exists in this organization
    const existingCampaign = await prisma.campaign.findFirst({
      where: { 
        id: parseInt(id),
        organizationName
      }
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Delete campaign (will cascade delete related donations and events if configured)
    await prisma.campaign.delete({
      where: { id: parseInt(id) }
    });

    // Create notification
    await createNotification({
      type: 'admin',
      message: `Campaign deleted: ${existingCampaign.name}`,
      organizationName,
      adminId
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
