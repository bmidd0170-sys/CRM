import { NextResponse } from 'next/server';
import { prisma, checkEmailExists, getAdminIdFromRequest, getAdminOrganization, verifyPermission } from '@/lib/db';
import { donorSchema, validateData, formatValidationErrors } from '@/lib/validators';
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

    // Get single donor by ID
    if (id) {
      const donor = await prisma.donor.findFirst({
        where: { 
          id: parseInt(id),
          organizationName
        },
        include: { donations: true }
      });

      if (!donor) {
        return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
      }

      return NextResponse.json(donor);
    }

    // Get all donors for this organization
    const donors = await prisma.donor.findMany({
      where: { organizationName },
      include: { donations: true },
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(donors);
  } catch (error) {
    console.error('Donor fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    console.log('[Donors API] Admin ID from request:', adminId);
    const permission = await verifyPermission(adminId, 'donors', 'create');
    console.log('[Donors API] Permission result:', permission);
    if (!permission.authorized) {
      console.error('[Donors API] Permission denied:', permission.error);
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }
    console.log('[Donors API] Permission granted');
    
    // Get admin organization
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    const data = await request.json();

    // Validate input data
    const validation = validateData(donorSchema, data);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    // Check if email already exists in this organization
    const emailExists = await checkEmailExists(validation.data.email, 'donor', organizationName);
    if (emailExists) {
      return NextResponse.json(
        { error: 'A donor with this email already exists in your organization' },
        { status: 409 }
      );
    }

    // Prepare data for creation
    const donorData = {
      ...validation.data,
      lastDonation: validation.data.lastDonation ? new Date(validation.data.lastDonation) : null,
      organizationName
    };

    // Create donor
    const newDonor = await prisma.donor.create({
      data: donorData,
      include: { donations: true }
    });

    // Create notification
    await createNotification({
      type: 'admin',
      message: `New donor added: ${newDonor.name}`,
      organizationName,
      adminId
    });

    return NextResponse.json(newDonor, { status: 201 });
  } catch (error) {
    console.error('Donor create error:', error);
    return NextResponse.json(
      { error: 'Failed to create donor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'Donor ID is required' }, { status: 400 });
    }

    // Validate input data
    const validation = validateData(donorSchema.partial(), updateData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    // Check if donor exists in this organization
    const existingDonor = await prisma.donor.findFirst({
      where: { 
        id: parseInt(id),
        organizationName
      }
    });

    if (!existingDonor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    // Check email uniqueness if email is being updated
    if (validation.data.email && validation.data.email !== existingDonor.email) {
      const emailExists = await checkEmailExists(validation.data.email, 'donor', organizationName);
      if (emailExists) {
        return NextResponse.json(
          { error: 'A donor with this email already exists in your organization' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const donorUpdateData = {
      ...validation.data,
      lastDonation: validation.data.lastDonation ? new Date(validation.data.lastDonation) : undefined
    };

    // Update donor
    const updatedDonor = await prisma.donor.update({
      where: { id: parseInt(id) },
      data: donorUpdateData,
      include: { donations: true }
    });

    // Create notification
    await createNotification({
      type: 'admin',
      message: `Donor updated: ${updatedDonor.name}`,
      organizationName,
      adminId
    });

    return NextResponse.json(updatedDonor);
  } catch (error) {
    console.error('Donor update error:', error);
    return NextResponse.json(
      { error: 'Failed to update donor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Donor ID is required' }, { status: 400 });
    }

    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'donors', 'delete');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }
    
    // Get admin organization
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    // Check if donor exists in this organization
    const existingDonor = await prisma.donor.findFirst({
      where: { 
        id: parseInt(id),
        organizationName
      }
    });

    if (!existingDonor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    // Delete donor (will cascade delete donations if configured)
    await prisma.donor.delete({
      where: { id: parseInt(id) }
    });

    // Create notification
    await createNotification({
      type: 'admin',
      message: `Donor deleted: ${existingDonor.name}`,
      organizationName,
      adminId
    });

    return NextResponse.json({ message: 'Donor deleted successfully' });
  } catch (error) {
    console.error('Donor delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete donor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Donor ID is required' }, { status: 400 });
    }

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

    const data = await request.json();

    // Check if donor exists in this organization
    const existingDonor = await prisma.donor.findFirst({
      where: { 
        id: parseInt(id),
        organizationName
      }
    });

    if (!existingDonor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    // Update lastContacted to current date/time
    const updatedDonor = await prisma.donor.update({
      where: { id: parseInt(id) },
      data: {
        lastContacted: new Date()
      },
      include: { donations: true }
    });

    // Create notification
    await createNotification({
      type: 'admin',
      message: `Donor contacted: ${updatedDonor.name}`,
      organizationName,
      adminId
    });

    return NextResponse.json(updatedDonor);
  } catch (error) {
    console.error('Donor contact update error:', error);
    return NextResponse.json(
      { error: 'Failed to update donor contact', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}