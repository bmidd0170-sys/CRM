export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma, checkEmailExists, getAdminIdFromRequest, verifyPermission } from '@/lib/db';
import { adminCreateSchema, adminUpdateSchema, validateData, formatValidationErrors } from '@/lib/validators';
import { hashPassword } from '@/lib/auth';

const adminSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  restrictions: true,
  online: true,
  changes: true,
  organizationName: true
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Get single admin by ID
    if (id) {
      const admin = await prisma.admin.findUnique({
        where: { id: parseInt(id) },
        select: adminSelect
      });

      if (!admin) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }

      return NextResponse.json(admin);
    }

    // Get all admins
    const admins = await prisma.admin.findMany({
      orderBy: { id: 'asc' },
      select: adminSelect
    });
    return NextResponse.json(admins);
  } catch (error) {
    console.error('Admin fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch admins',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('[API] Received data:', { ...data, password: '[HIDDEN]' });

    // Check if this is the first admin (allow without authentication for initial setup)
    const adminCount = await prisma.admin.count();
    console.log('[API] Current admin count:', adminCount);
    
    // If there are existing admins, require authentication
    if (adminCount > 0) {
      const adminId = getAdminIdFromRequest(request);
      console.log('[API] Creating admin - Admin ID from request:', adminId);
      const permission = await verifyPermission(adminId, 'admins', 'create');
      console.log('[API] Permission check result:', permission);
      if (!permission.authorized) {
        console.error('[API] Permission denied:', permission.error);
        return NextResponse.json({ error: permission.error }, { status: permission.status });
      }
    } else {
      console.log('[API] First admin creation - skipping authentication');
    }

    // Validate input data
    const validation = validateData(adminCreateSchema, data);
    if (!validation.success) {
      console.error('[API] Validation failed:', formatValidationErrors(validation.error));
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    const { password, ...adminData } = validation.data;

    // Check if email already exists
    const emailExists = await checkEmailExists(adminData.email, 'admin');
    if (emailExists) {
      console.error('[API] Email already exists:', adminData.email);
      return NextResponse.json(
        { error: 'An admin with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    console.log('[API] Password hashed, creating admin in database...');

    const adminCreateData: Prisma.AdminCreateInput = {
      ...adminData,
      passwordHash
    };

    // Create admin
    const newAdmin = await prisma.admin.create({
      data: adminCreateData,
      select: adminSelect
    });
    console.log('[API] Admin created successfully in database:', newAdmin);

    return NextResponse.json({ admin: newAdmin, data: newAdmin }, { status: 201 });
  } catch (error) {
    console.error('Admin create error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'admins', 'update');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    // Validate input data
    const validation = validateData(adminUpdateSchema, updateData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Check email uniqueness if email is being updated
    if (validation.data.email && validation.data.email !== existingAdmin.email) {
      const emailExists = await checkEmailExists(validation.data.email, 'admin');
      if (emailExists) {
        return NextResponse.json(
          { error: 'An admin with this email already exists' },
          { status: 409 }
        );
      }
    }

    const { password, ...safeData } = validation.data;
    const passwordHash = password ? hashPassword(password) : undefined;

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: { ...safeData, ...(passwordHash ? { passwordHash } : {}) },
      select: adminSelect
    });

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error('Admin update error:', error);
    return NextResponse.json(
      { error: 'Failed to update admin', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Delete admin
    await prisma.admin.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Admin delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
