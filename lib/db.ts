import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Ensure the database URL is present at runtime so Prisma can connect.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Add it to your environment (.env) to enable database access.');
}

// Use SSL for remote hosts (e.g., Neon) and skip for local connections.
const useSsl = !/localhost|127\.0\.0\.1/i.test(databaseUrl);
const poolConfig = {
  connectionString: databaseUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
};

// Singleton pattern for Prisma Client to prevent multiple instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter: new PrismaPg(poolConfig),
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper functions for common database operations

export async function checkEmailExists(email: string, model: 'admin' | 'donor', organizationName?: string) {
  if (model === 'admin') {
    const record = await prisma.admin.findUnique({
      where: { email },
      select: { id: true }
    });
    return !!record;
  } else {
    if (!organizationName) {
      // If no organization provided, just check email exists globally
      const records = await prisma.donor.findMany({
        where: { email },
        select: { id: true }
      });
      return records.length > 0;
    }
    // Check if email exists within the specific organization
    const record = await prisma.donor.findUnique({
      where: { 
        email_organizationName: {
          email,
          organizationName
        }
      },
      select: { id: true }
    });
    return !!record;
  }
}

export async function checkCampaignExists(id: number) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { id: true }
  });
  return !!campaign;
}

export async function checkDonorExists(id: number) {
  const donor = await prisma.donor.findUnique({
    where: { id },
    select: { id: true }
  });
  return !!donor;
}

export async function updateDonorTotal(donorId: number) {
  const total = await prisma.donation.aggregate({
    where: { donorId },
    _sum: { amount: true }
  });

  await prisma.donor.update({
    where: { id: donorId },
    data: {
      total: total._sum.amount || 0,
      lastDonation: new Date()
    }
  });
}

export async function updateCampaignRaised(campaignId: number) {
  const total = await prisma.donation.aggregate({
    where: { campaignId },
    _sum: { amount: true }
  });

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { raised: total._sum.amount || 0 }
  });
}

// Authorization helpers
export async function checkIsSuperAdmin(adminId: number): Promise<boolean> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { role: true }
  });
  return admin?.role === 'Super Admin';
}

export async function getAdminOrganization(adminId: number): Promise<string | null> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { organizationName: true }
  });
  return admin?.organizationName || null;
}

export function getAdminIdFromRequest(request: Request): number | null {
  try {
    const adminIdHeader = request.headers.get('x-admin-id');
    console.log('[getAdminIdFromRequest] x-admin-id header value:', adminIdHeader);
    if (!adminIdHeader) {
      console.log('[getAdminIdFromRequest] No x-admin-id header found');
      return null;
    }
    const adminId = parseInt(adminIdHeader);
    console.log('[getAdminIdFromRequest] Parsed admin ID:', adminId);
    return isNaN(adminId) ? null : adminId;
  } catch (error) {
    console.error('[getAdminIdFromRequest] Error parsing admin ID:', error);
    return null;
  }
}

// Permission system
export type PermissionAction = 'create' | 'read' | 'update' | 'delete';
export type PermissionResource = 'donors' | 'campaigns' | 'events' | 'donations' | 'notifications' | 'admins' | 'reports' | 'settings';

/**
 * Get admin with restrictions
 */
export async function getAdminWithRestrictions(adminId: number) {
  return await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      role: true,
      restrictions: true
    }
  });
}

/**
 * Check if admin has permission to perform action on resource
 * Super Admins always have full access
 * Regular admins are checked against their restrictions
 */
export async function checkPermission(
  adminId: number,
  resource: PermissionResource,
  action: PermissionAction
): Promise<{ allowed: boolean; reason?: string }> {
  console.log(`[Permission Check] Admin ID: ${adminId}, Resource: ${resource}, Action: ${action}`);

  const admin = await getAdminWithRestrictions(adminId);

  if (!admin) {
    console.log(`[Permission Check] Admin not found for ID: ${adminId}`);
    return { allowed: false, reason: 'Admin not found' };
  }

  console.log(`[Permission Check] Admin found:`, { id: admin.id, role: admin.role, restrictions: admin.restrictions });

  // Super Admins have all permissions
  if (admin.role === 'Super Admin') {
    console.log(`[Permission Check] Super Admin - access granted`);
    return { allowed: true };
  }

  // Check restrictions
  const restrictions = admin.restrictions || [];

  // Check for "No Delete" restriction
  if (action === 'delete' && restrictions.includes('No Delete')) {
    console.log(`[Permission Check] Blocked by "No Delete" restriction`);
    return { allowed: false, reason: 'Admin does not have delete permissions' };
  }

  // Check for "No Edit" restriction (covers both create and update)
  if ((action === 'create' || action === 'update') && restrictions.includes('No Edit')) {
    console.log(`[Permission Check] Blocked by "No Edit" restriction`);
    return { allowed: false, reason: 'Admin does not have edit permissions' };
  }

  // Check for resource-specific restrictions (e.g., "donors", "campaigns", "events")
  if (restrictions.includes(resource)) {
    console.log(`[Permission Check] Blocked by resource restriction: ${resource}`);
    return { allowed: false, reason: `Admin does not have access to ${resource}` };
  }

  // Check for combined restrictions (e.g., "No Delete donors")
  const combinedRestriction = `No ${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`;
  if (restrictions.some(r => r.toLowerCase() === combinedRestriction.toLowerCase())) {
    console.log(`[Permission Check] Blocked by combined restriction: ${combinedRestriction}`);
    return { allowed: false, reason: `Admin cannot ${action} ${resource}` };
  }

  // If no restrictions matched, allow the action
  console.log(`[Permission Check] Access granted - no restrictions matched`);
  return { allowed: true };
}

/**
 * Middleware helper to verify permission and return appropriate error response
 */
export async function verifyPermission(
  adminId: number | null,
  resource: PermissionResource,
  action: PermissionAction
): Promise<{ authorized: true } | { authorized: false; status: number; error: string }> {
  console.log(`[Verify Permission] Called with adminId: ${adminId}, resource: ${resource}, action: ${action}`);

  if (!adminId) {
    console.log(`[Verify Permission] No admin ID provided - returning 401`);
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized: Admin authentication required'
    };
  }

  const permission = await checkPermission(adminId, resource, action);

  if (!permission.allowed) {
    console.log(`[Verify Permission] Permission denied - returning 403`);
    return {
      authorized: false,
      status: 403,
      error: `Forbidden: ${permission.reason || 'Access denied'}`
    };
  }

  console.log(`[Verify Permission] Permission granted`);
  return { authorized: true };
}
