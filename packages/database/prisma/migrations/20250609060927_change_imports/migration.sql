/*
  Warnings:

  - You are about to drop the `recipe_import_jobs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RecipeImportStatus" AS ENUM ('PARSING', 'COMPLETE', 'FAILED');

-- DropForeignKey
ALTER TABLE "recipe_import_jobs" DROP CONSTRAINT "recipe_import_jobs_user_id_fkey";

-- DropTable
DROP TABLE "recipe_import_jobs";

-- DropEnum
DROP TYPE "RecipeImportJobStatus";

-- CreateTable
CREATE TABLE "recipe_imports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "status" "RecipeImportStatus" NOT NULL DEFAULT 'PARSING',
    "error" TEXT,

    CONSTRAINT "recipe_imports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "recipe_imports" ADD CONSTRAINT "recipe_imports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
