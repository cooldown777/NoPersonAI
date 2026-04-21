-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'user';

-- Promote the owner to admin if that account already exists.
UPDATE "User" SET "role" = 'admin' WHERE "email" = 'luisnburger@gmail.com';
