-- Extend Language enum with fr and es for multi-locale support.
-- Postgres does not allow ADD VALUE inside a transaction block.
ALTER TYPE "Language" ADD VALUE 'fr';
ALTER TYPE "Language" ADD VALUE 'es';
