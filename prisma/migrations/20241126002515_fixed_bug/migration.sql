/*
  Warnings:

  - You are about to drop the column `eventId` on the `tickets` table. All the data in the column will be lost.
  - Added the required column `event_id` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_eventId_fkey";

-- DropIndex
DROP INDEX "tickets_id_eventId_idx";

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "eventId",
ADD COLUMN     "event_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "tickets_id_event_id_idx" ON "tickets"("id", "event_id");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
