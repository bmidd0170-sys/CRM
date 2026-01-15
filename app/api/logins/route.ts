import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { loginSchema, validateData, formatValidationErrors } from '@/lib/validators';

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

    const { email, password } = validation.data;

    // Check if admin exists with this email
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        restrictions: true,
        online: true,
        changes: true
      }
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // In production, you should verify the password against a hashed version
    // For now, this is a basic implementation
    // TODO: Add proper password hashing verification (bcrypt, argon2, etc.)

    // Update admin online status
    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: { online: true }
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        restrictions: updatedAdmin.restrictions,
        online: updatedAdmin.online,
        changes: updatedAdmin.changes
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
