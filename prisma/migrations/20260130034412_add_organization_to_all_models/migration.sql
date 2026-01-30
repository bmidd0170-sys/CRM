/*
  Warnings:

  - A unique constraint covering the columns `[email,organizationName]` on the table `Donor` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Donor_email_key";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "passwordHash" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "organizationName" TEXT NOT NULL DEFAULT 'Helping Hands',
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "organizationName" TEXT NOT NULL DEFAULT 'Helping Hands';

-- AlterTable
ALTER TABLE "Donor" ADD COLUMN     "organizationName" TEXT NOT NULL DEFAULT 'Helping Hands';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "organizationName" TEXT NOT NULL DEFAULT 'Helping Hands',
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "organizationName" TEXT NOT NULL DEFAULT 'Helping Hands';

-- CreateIndex
CREATE UNIQUE INDEX "Donor_email_organizationName_key" ON "Donor"("email", "organizationName");
