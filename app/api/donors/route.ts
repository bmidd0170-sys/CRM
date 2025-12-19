import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const donors = await prisma.donor.findMany({
      include: { donations: true }
    });
    return NextResponse.json(donors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newDonor = await prisma.donor.create({
      data
    });
    return NextResponse.json(newDonor);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create donor' }, { status: 500 });
  }
}
