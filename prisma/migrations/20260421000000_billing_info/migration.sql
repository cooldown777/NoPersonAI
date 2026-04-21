-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "billingName"         TEXT,
  ADD COLUMN "billingCompany"      TEXT,
  ADD COLUMN "billingEmail"        TEXT,
  ADD COLUMN "billingAddressLine1" TEXT,
  ADD COLUMN "billingAddressLine2" TEXT,
  ADD COLUMN "billingCity"         TEXT,
  ADD COLUMN "billingPostalCode"   TEXT,
  ADD COLUMN "billingCountry"      TEXT,
  ADD COLUMN "billingVatId"        TEXT;
