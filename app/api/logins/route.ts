import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    // Example: check if admin exists
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin) {
      return NextResponse.json({ success: true, admin });
    } else {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
