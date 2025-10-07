/*
  Warnings:

  - The `image` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "nacimiento" INTEGER,
DROP COLUMN "image",
ADD COLUMN     "image" BYTEA,
ALTER COLUMN "idCiudad" SET DEFAULT 10;
