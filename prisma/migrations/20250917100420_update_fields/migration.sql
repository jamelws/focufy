-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('TEXT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SCALE_1_5');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "idCiudad" INTEGER,
ADD COLUMN     "idPais" INTEGER DEFAULT 139;

-- CreateTable
CREATE TABLE "public"."UserGenre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserGenre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MusicSet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Song" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSec" INTEGER,
    "musicSetId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "versionLabel" TEXT,
    "lyrics" TEXT,
    "file" BYTEA NOT NULL,
    "image" BYTEA,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShareToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "musicSetId" TEXT,
    "songId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pullId" INTEGER,

    CONSTRAINT "ShareToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShareTokenUser" (
    "id" SERIAL NOT NULL,
    "shareTokenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aprovado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShareTokenUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" SERIAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "help" TEXT,
    "key" TEXT NOT NULL,
    "order" INTEGER,
    "title" TEXT NOT NULL,
    "type" "public"."QuestionType" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "titleEn" TEXT DEFAULT '',
    "titleFr" TEXT DEFAULT '',

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestionOption" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER,
    "labelEn" TEXT DEFAULT '',
    "labelFr" TEXT DEFAULT '',

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Response" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userId" TEXT,
    "shareTokenId" TEXT,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pull" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Pull_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PullUsers" (
    "id" SERIAL NOT NULL,
    "pullId" INTEGER NOT NULL,
    "userId" TEXT,
    "correo" TEXT,

    CONSTRAINT "PullUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SongPlay" (
    "id" BIGSERIAL NOT NULL,
    "songId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "replayCount" INTEGER NOT NULL DEFAULT 0,
    "stoppedAtSec" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,

    CONSTRAINT "SongPlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SongQuestion" (
    "id" SERIAL NOT NULL,
    "songId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "SongQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pais" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ciudad" (
    "id" SERIAL NOT NULL,
    "idPais" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Ciudad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MusicSet_userId_idx" ON "public"."MusicSet"("userId");

-- CreateIndex
CREATE INDEX "MusicSet_startsAt_idx" ON "public"."MusicSet"("startsAt");

-- CreateIndex
CREATE INDEX "MusicSet_endsAt_idx" ON "public"."MusicSet"("endsAt");

-- CreateIndex
CREATE INDEX "Song_musicSetId_idx" ON "public"."Song"("musicSetId");

-- CreateIndex
CREATE INDEX "Song_artistId_idx" ON "public"."Song"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareToken_token_key" ON "public"."ShareToken"("token");

-- CreateIndex
CREATE INDEX "ShareToken_ownerId_idx" ON "public"."ShareToken"("ownerId");

-- CreateIndex
CREATE INDEX "ShareToken_musicSetId_idx" ON "public"."ShareToken"("musicSetId");

-- CreateIndex
CREATE INDEX "ShareToken_songId_idx" ON "public"."ShareToken"("songId");

-- CreateIndex
CREATE INDEX "ShareToken_pullId_idx" ON "public"."ShareToken"("pullId");

-- CreateIndex
CREATE INDEX "ShareToken_expiresAt_idx" ON "public"."ShareToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Question_userId_key_key" ON "public"."Question"("userId", "key");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_idx" ON "public"."QuestionOption"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_value_key" ON "public"."QuestionOption"("questionId", "value");

-- CreateIndex
CREATE INDEX "Response_songId_idx" ON "public"."Response"("songId");

-- CreateIndex
CREATE INDEX "Response_questionId_idx" ON "public"."Response"("questionId");

-- CreateIndex
CREATE INDEX "Response_userId_idx" ON "public"."Response"("userId");

-- CreateIndex
CREATE INDEX "Response_shareTokenId_idx" ON "public"."Response"("shareTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Response_songId_questionId_userId_shareTokenId_key" ON "public"."Response"("songId", "questionId", "userId", "shareTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "SongPlay_userId_songId_key" ON "public"."SongPlay"("userId", "songId");

-- CreateIndex
CREATE UNIQUE INDEX "SongQuestion_songId_questionId_key" ON "public"."SongQuestion"("songId", "questionId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_idCiudad_fkey" FOREIGN KEY ("idCiudad") REFERENCES "public"."Ciudad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_idPais_fkey" FOREIGN KEY ("idPais") REFERENCES "public"."Pais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserGenre" ADD CONSTRAINT "UserGenre_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MusicSet" ADD CONSTRAINT "MusicSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Song" ADD CONSTRAINT "Song_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Song" ADD CONSTRAINT "Song_musicSetId_fkey" FOREIGN KEY ("musicSetId") REFERENCES "public"."MusicSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShareToken" ADD CONSTRAINT "ShareToken_musicSetId_fkey" FOREIGN KEY ("musicSetId") REFERENCES "public"."MusicSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShareToken" ADD CONSTRAINT "ShareToken_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShareToken" ADD CONSTRAINT "ShareToken_pullId_fkey" FOREIGN KEY ("pullId") REFERENCES "public"."Pull"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShareToken" ADD CONSTRAINT "ShareToken_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShareTokenUser" ADD CONSTRAINT "ShareTokenUser_shareTokenId_fkey" FOREIGN KEY ("shareTokenId") REFERENCES "public"."ShareToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShareTokenUser" ADD CONSTRAINT "ShareTokenUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_shareTokenId_fkey" FOREIGN KEY ("shareTokenId") REFERENCES "public"."ShareToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Response" ADD CONSTRAINT "Response_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pull" ADD CONSTRAINT "Pull_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PullUsers" ADD CONSTRAINT "PullUsers_pullId_fkey" FOREIGN KEY ("pullId") REFERENCES "public"."Pull"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PullUsers" ADD CONSTRAINT "PullUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SongPlay" ADD CONSTRAINT "SongPlay_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SongPlay" ADD CONSTRAINT "SongPlay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SongQuestion" ADD CONSTRAINT "SongQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SongQuestion" ADD CONSTRAINT "SongQuestion_songId_fkey" FOREIGN KEY ("songId") REFERENCES "public"."Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ciudad" ADD CONSTRAINT "Ciudad_idPais_fkey" FOREIGN KEY ("idPais") REFERENCES "public"."Pais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
