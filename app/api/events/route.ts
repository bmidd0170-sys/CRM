import { NextResponse } from 'next/server';
import { prisma, checkCampaignExists, getAdminIdFromRequest, verifyPermission } from '@/lib/db';
import { eventSchema, validateData, formatValidationErrors } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Get single event by ID
    if (id) {
      const event = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        include: { campaign: true }
      });

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json(event);
    }

    // Get all events
    const events = await prisma.event.findMany({
      include: { campaign: true },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'events', 'create');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }

    const data = await request.json();

    // Validate input data
    const validation = validateData(eventSchema, data);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    // Verify campaign exists if campaignId is provided
    if (validation.data.campaignId) {
      const campaignExists = await checkCampaignExists(validation.data.campaignId);
      if (!campaignExists) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
    }

    // Prepare data for creation
    const eventData = {
      ...validation.data,
      date: new Date(validation.data.date)
    };

    // Create event
    const newEvent = await prisma.event.create({
      data: eventData,
      include: { campaign: true }
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Event create error:', error);
    return NextResponse.json(
      { error: 'Failed to create event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'events', 'update');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Validate input data
    const validation = validateData(eventSchema.partial(), updateData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify campaign exists if campaignId is being updated
    if (validation.data.campaignId) {
      const campaignExists = await checkCampaignExists(validation.data.campaignId);
      if (!campaignExists) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
    }

    // Prepare update data
    const eventUpdateData = {
      ...validation.data,
      date: validation.data.date ? new Date(validation.data.date) : undefined
    };

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: eventUpdateData,
      include: { campaign: true }
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json(
      { error: 'Failed to update event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'events', 'delete');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete event
    await prisma.event.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Event delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
