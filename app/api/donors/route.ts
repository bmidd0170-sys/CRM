import { NextResponse } from 'next/server';
import { prisma, checkEmailExists, checkIsSuperAdmin, getAdminIdFromRequest } from '@/lib/db';
import { donorSchema, validateData, formatValidationErrors } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Get single donor by ID
    if (id) {
      const donor = await prisma.donor.findUnique({
        where: { id: parseInt(id) },
        include: { donations: true }
      });

      if (!donor) {
        return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
      }

      return NextResponse.json(donor);
    }

    // Get all donors
    const donors = await prisma.donor.findMany({
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

    // Check if email already exists
    const emailExists = await checkEmailExists(validation.data.email, 'donor');
    if (emailExists) {
      return NextResponse.json(
        { error: 'A donor with this email already exists' },
        { status: 409 }
      );
    }

    // Prepare data for creation
    const donorData = {
      ...validation.data,
      lastDonation: validation.data.lastDonation ? new Date(validation.data.lastDonation) : null
    };

    // Create donor
    const newDonor = await prisma.donor.create({
      data: donorData,
      include: { donations: true }
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

    // Check if donor exists
    const existingDonor = await prisma.donor.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingDonor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    // Check email uniqueness if email is being updated
    if (validation.data.email && validation.data.email !== existingDonor.email) {
      const emailExists = await checkEmailExists(validation.data.email, 'donor');
      if (emailExists) {
        return NextResponse.json(
          { error: 'A donor with this email already exists' },
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

    // Check if admin is logged in and is a Super Admin
    const adminId = getAdminIdFromRequest(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const isSuperAdmin = await checkIsSuperAdmin(adminId);
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden: Only Super Admins can delete donors' }, { status: 403 });
    }

    // Check if donor exists
    const existingDonor = await prisma.donor.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingDonor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    // Delete donor (will cascade delete donations if configured)
    await prisma.donor.delete({
      where: { id: parseInt(id) }
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
