-- Rename TRAINER to STAFF in UserRole enum
ALTER TYPE "UserRole" RENAME VALUE 'TRAINER' TO 'STAFF';

-- CreateTable
CREATE TABLE "check_ins" (
    "id" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkedInBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "check_ins_gymId_idx" ON "check_ins"("gymId");

-- CreateIndex
CREATE INDEX "check_ins_userId_idx" ON "check_ins"("userId");

-- CreateIndex
CREATE INDEX "check_ins_createdAt_idx" ON "check_ins"("createdAt");

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_checkedInBy_fkey" FOREIGN KEY ("checkedInBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
