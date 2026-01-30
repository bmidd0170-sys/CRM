export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { loginSchema, validateData, formatValidationErrors } from '@/lib/validators';
import { verifyPassword, hashPassword } from '@/lib/auth';

const adminSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  restrictions: true,
  online: true,
  changes: true,
  organizationName: true
} satisfies Prisma.AdminSelect;

const adminWithPasswordSelect = {
  ...adminSelect,
  passwordHash: true
} satisfies Prisma.AdminSelect;

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate input data
    const validation = validateData(loginSchema, data);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    const { email, password, organizationName } = validation.data;

    // Check if admin exists with this email
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: adminWithPasswordSelect
    });

    // If no admin exists yet, auto-provision a new Super Admin
    if (!admin) {
      const orgName = organizationName || 'Helping Hands';
      
      const newAdmin = await prisma.admin.create({
        data: {
          name: email.split('@')[0] || 'New Admin',
          email,
          role: 'Super Admin',
          restrictions: [],
          online: true,
          changes: ['Account created'],
          organizationName: orgName,
          passwordHash: hashPassword(password)
        },
        select: adminSelect
      });

      return NextResponse.json(
        {
          success: true,
          admin: newAdmin,
          created: true,
          clearTempData: true
        },
        { status: 201 }
      );
    }

    const passwordOk = admin?.passwordHash ? verifyPassword(password, admin.passwordHash) : false;

    if (!passwordOk) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update admin online status
    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: { online: true },
      select: adminSelect
    });

    return NextResponse.json({
      success: true,
      admin: {
        ...updatedAdmin
      },
      // Signal that client should clear temporary data
      clearTempData: true
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { adminId, online } = data;

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    // Update admin online/offline status
    const updatedAdmin = await prisma.admin.update({
      where: { id: parseInt(adminId) },
      data: { online: !!online }
    });

    return NextResponse.json({
      success: true,
      admin: updatedAdmin
    });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
