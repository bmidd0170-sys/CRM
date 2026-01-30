import { prisma, getAdminName } from './db';

interface CreateNotificationParams {
  type: 'admin' | 'reminder';
  message: string;
  organizationName: string;
  adminId?: number | null;
}

/**
 * Helper function to create a notification
 */
export async function createNotification({
  type,
  message,
  organizationName,
  adminId
}: CreateNotificationParams) {
  try {
    const adminName = await getAdminName(adminId || null);
    const fullMessage = `${message} (by ${adminName})`;
    
    await prisma.notification.create({
      data: {
        type,
        message: fullMessage,
        date: new Date(),
        read: false,
        organizationName
      }
    });
    console.log(`[Notification] Created: ${fullMessage}`);
  } catch (error) {
    console.error('[Notification] Failed to create notification:', error);
    // Don't throw error - notifications should not break the main operation
  }
}
