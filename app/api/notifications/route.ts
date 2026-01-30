import { NextResponse } from 'next/server';
import { prisma, getAdminIdFromRequest, getAdminOrganization, verifyPermission } from '@/lib/db';
import { notificationSchema, validateData, formatValidationErrors } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const unreadOnly = searchParams.get('unread');
    
    // Get admin organization
    const adminId = getAdminIdFromRequest(request);
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    // Get single notification by ID
    if (id) {
      const notification = await prisma.notification.findFirst({
        where: { 
          id: parseInt(id),
          organizationName
        }
      });

      if (!notification) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }

      return NextResponse.json(notification);
    }

    // Get notifications (filter by unread if specified)
    const where: any = { organizationName };
    if (unreadOnly === 'true') where.read = false;
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Notification fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    console.log('[Notifications API] Admin ID from request:', adminId);
    const permission = await verifyPermission(adminId, 'notifications', 'create');
    console.log('[Notifications API] Permission result:', permission);
    if (!permission.authorized) {
      console.error('[Notifications API] Permission denied:', permission.error);
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }
    console.log('[Notifications API] Permission granted');
    
    // Get admin organization
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    const data = await request.json();

    // Validate input data
    const validation = validateData(notificationSchema, data);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    // Prepare data for creation
    const notificationData = {
      ...validation.data,
      date: new Date(validation.data.date),
      organizationName
    };

    // Create notification
    const newNotification = await prisma.notification.create({
      data: notificationData
    });

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error('Notification create error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'notifications', 'update');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }

    // Get admin's organization
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    // Validate input data
    const validation = validateData(notificationSchema.partial(), updateData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      );
    }

    // Check if notification exists and belongs to the same organization
    const existingNotification = await prisma.notification.findFirst({
      where: { 
        id: parseInt(id),
        organizationName
      }
    });

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Prepare update data
    const notificationUpdateData = {
      ...validation.data,
      date: validation.data.date ? new Date(validation.data.date) : undefined
    };

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: notificationUpdateData
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    // Check permissions
    const adminId = getAdminIdFromRequest(request);
    const permission = await verifyPermission(adminId, 'notifications', 'delete');
    if (!permission.authorized) {
      return NextResponse.json({ error: permission.error }, { status: permission.status });
    }

    // Get admin's organization
    const organizationName = adminId ? await getAdminOrganization(adminId) : null;
    if (!organizationName) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 401 });
    }

    // Check if notification exists and belongs to the same organization
    const existingNotification = await prisma.notification.findFirst({
      where: { 
        id: parseInt(id),
        organizationName
      }
    });

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Notification delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
