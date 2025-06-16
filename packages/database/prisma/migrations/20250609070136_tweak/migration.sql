/*
  Warnings:

  - The values [PARSING,COMPLETE,FAILED] on the enum `RecipeImportStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RecipeImportStatus_new" AS ENUM ('parsing', 'complete', 'failed');
ALTER TABLE "recipe_imports" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "recipe_imports" ALTER COLUMN "status" TYPE "RecipeImportStatus_new" USING ("status"::text::"RecipeImportStatus_new");
ALTER TYPE "RecipeImportStatus" RENAME TO "RecipeImportStatus_old";
ALTER TYPE "RecipeImportStatus_new" RENAME TO "RecipeImportStatus";
DROP TYPE "RecipeImportStatus_old";
ALTER TABLE "recipe_imports" ALTER COLUMN "status" SET DEFAULT 'parsing';
COMMIT;

-- AlterTable
ALTER TABLE "recipe_imports" ALTER COLUMN "status" SET DEFAULT 'parsing';
