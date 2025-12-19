import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const admins = await prisma.admin.findMany();
    return NextResponse.json(admins);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newAdmin = await prisma.admin.create({ data });
    return NextResponse.json(newAdmin);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
