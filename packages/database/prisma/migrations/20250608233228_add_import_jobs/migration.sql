-- CreateEnum
CREATE TYPE "RecipeImportJobStatus" AS ENUM ('processing', 'failed');

-- CreateTable
CREATE TABLE "recipe_import_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "status" "RecipeImportJobStatus" NOT NULL DEFAULT 'processing',

    CONSTRAINT "recipe_import_jobs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "recipe_import_jobs" ADD CONSTRAINT "recipe_import_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
