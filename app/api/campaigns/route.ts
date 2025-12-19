import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({ include: { events: true, donations: true } });
    return NextResponse.json(campaigns);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newCampaign = await prisma.campaign.create({ data });
    return NextResponse.json(newCampaign);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
