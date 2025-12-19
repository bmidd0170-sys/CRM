const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Admins
  await prisma.admin.createMany({
    data: [
      {
        name: "Alice Smith",
        email: "alice@email.com",
        role: "Super Admin",
        restrictions: [],
        online: true,
        changes: [
          "Created new donor: Sarah Johnson",
          "Updated campaign: Winter Relief",
          "Changed admin privileges for Bob Lee",
        ],
      },
      {
        name: "Bob Lee",
        email: "bob@email.com",
        role: "Admin",
        restrictions: ["No Delete"],
        online: false,
        changes: ["Edited donor: Michael Chen", "Viewed report: Lapsed Donors"],
      },
    ],
  });

  // Donors
  await prisma.donor.createMany({
    data: [
      {
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        total: 2500,
        lastDonation: new Date("2024-12-15"),
        status: "Active",
        tags: ["Major"],
      },
      {
        name: "Michael Chen",
        email: "m.chen@email.com",
        total: 1200,
        lastDonation: new Date("2024-12-14"),
        status: "Inactive",
        tags: [],
      },
      {
        name: "Emily Rodriguez",
        email: "emily.r@email.com",
        total: 3000,
        lastDonation: new Date("2024-12-13"),
        status: "Active",
        tags: ["Major"],
      },
      {
        name: "David Park",
        email: "d.park@email.com",
        total: 1750,
        lastDonation: new Date("2024-12-12"),
        status: "Active",
        tags: [],
      },
      {
        name: "Jennifer Williams",
        email: "jen.w@email.com",
        total: 900,
        lastDonation: new Date("2024-12-11"),
        status: "Inactive",
        tags: [],
      },
    ],
  });

  // Campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      name: "Winter Relief",
      goal: 5000,
      raised: 2500,
      startDate: new Date("2024-12-01"),
      endDate: new Date("2025-01-31"),
      description:
        "Providing warm clothing and food for families in need during winter.",
    },
  });
  const campaign2 = await prisma.campaign.create({
    data: {
      name: "Education Fund",
      goal: 10000,
      raised: 3000,
      startDate: new Date("2024-11-01"),
      endDate: new Date("2025-03-01"),
      description:
        "Supporting underprivileged children with school supplies and tuition.",
    },
  });

  // Events
  await prisma.event.createMany({
    data: [
      {
        name: "Annual Fundraiser",
        date: new Date("2025-02-15"),
        description: "Our biggest fundraising event of the year!",
        image: null,
        campaignId: campaign1.id,
      },
      {
        name: "Back to School Drive",
        date: new Date("2025-01-10"),
        description: "Collecting supplies for students.",
        image: null,
        campaignId: campaign2.id,
      },
    ],
  });

  // Donations
  const donors = await prisma.donor.findMany();
  await prisma.donation.createMany({
    data: [
      {
        amount: 500,
        date: new Date("2024-12-15"),
        donorId: donors[0].id,
        campaignId: campaign1.id,
      },
      {
        amount: 1000,
        date: new Date("2024-12-13"),
        donorId: donors[2].id,
        campaignId: campaign2.id,
      },
      {
        amount: 750,
        date: new Date("2024-12-12"),
        donorId: donors[3].id,
        campaignId: campaign1.id,
      },
    ],
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        type: "reminder",
        message: "Contact Sarah Johnson for follow-up on her recent donation.",
        date: new Date("2025-12-19"),
        read: false,
      },
      {
        type: "reminder",
        message: "Send thank you letter to Emily Rodriguez.",
        date: new Date("2025-12-20"),
        read: false,
      },
      {
        type: "admin",
        message: "Board meeting scheduled for December 22, 2025.",
        date: new Date("2025-12-22"),
        read: false,
      },
      {
        type: "reminder",
        message: "Call Michael Chen to discuss recurring donation options.",
        date: new Date("2025-12-21"),
        read: true,
      },
      {
        type: "admin",
        message: "Prepare monthly donation report for review.",
        date: new Date("2025-12-25"),
        read: false,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
