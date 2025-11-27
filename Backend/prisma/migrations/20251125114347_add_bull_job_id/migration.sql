-- AlterTable
ALTER TABLE "sync_jobs" ADD COLUMN     "bullJobId" TEXT;

-- CreateIndex
CREATE INDEX "sync_jobs_bullJobId_idx" ON "sync_jobs"("bullJobId");
