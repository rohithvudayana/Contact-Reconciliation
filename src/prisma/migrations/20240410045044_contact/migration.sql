/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `linkPrecedence` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Contact` table. All the data in the column will be lost.
  - Added the required column `linkprecedence` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedat` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "linkPrecedence",
DROP COLUMN "phoneNumber",
DROP COLUMN "updatedAt",
ADD COLUMN     "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedat" TIMESTAMP(3),
ADD COLUMN     "linkprecedence" "LinkPrecedence" NOT NULL,
ADD COLUMN     "phonenumber" TEXT,
ADD COLUMN     "updatedat" TIMESTAMP(3) NOT NULL;
