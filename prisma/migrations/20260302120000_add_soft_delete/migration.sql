-- DropIndex
DROP INDEX "users_gymId_email_key";

-- DropIndex
DROP INDEX "users_gymId_phone_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Partial unique indexes: enforce uniqueness only for non-deleted rows,
-- allowing re-registration with the same email/phone after a soft delete.
CREATE UNIQUE INDEX "users_gymid_email_unique"
  ON "users" ("gymId", email)
  WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "users_gymid_phone_unique"
  ON "users" ("gymId", phone)
  WHERE "deletedAt" IS NULL;
