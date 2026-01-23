import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Singleton pattern for Prisma Client to prevent multiple instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter: new PrismaPg({
    url: process.env.DATABASE_URL,
  }),
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper functions for common database operations

export async function checkEmailExists(email: string, model: 'admin' | 'donor') {
  if (model === 'admin') {
    const record = await prisma.admin.findUnique({
      where: { email },
      select: { id: true }
    });
    return !!record;
  } else {
    const record = await prisma.donor.findUnique({
      where: { email },
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

export function getAdminIdFromRequest(request: Request): number | null {
  try {
    const adminIdHeader = request.headers.get('x-admin-id');
    if (!adminIdHeader) return null;
    const adminId = parseInt(adminIdHeader);
    return isNaN(adminId) ? null : adminId;
  } catch {
    return null;
  }
}
