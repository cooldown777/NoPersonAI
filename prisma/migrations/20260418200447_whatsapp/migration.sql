-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'pro');

-- CreateEnum
CREATE TYPE "Tone" AS ENUM ('professional', 'casual', 'storytelling', 'controversial');

-- CreateEnum
CREATE TYPE "WritingStyle" AS ENUM ('punchy', 'longform', 'mixed');

-- CreateEnum
CREATE TYPE "EmojiUsage" AS ENUM ('none', 'light', 'heavy');

-- CreateEnum
CREATE TYPE "OnboardingMethod" AS ENUM ('sample_posts', 'style_discovery', 'both');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('de', 'en');

-- CreateEnum
CREATE TYPE "PostStructure" AS ENUM ('hook_story', 'contrarian', 'personal', 'list', 'lesson');

-- CreateEnum
CREATE TYPE "RefinementType" AS ENUM ('stronger_hook', 'different_cta', 'change_takeaway', 'shorter', 'longer', 'more_casual', 'more_professional', 'add_emojis', 'remove_emojis', 'different_angle', 'custom');

-- CreateEnum
CREATE TYPE "WhatsAppStatus" AS ENUM ('pending', 'verified', 'revoked');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('received', 'transcribing', 'generating', 'sent', 'failed');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "phoneE164" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'free',
    "postsUsedThisMonth" INTEGER NOT NULL DEFAULT 0,
    "postsResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingDNA" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tone" "Tone" NOT NULL DEFAULT 'professional',
    "audience" TEXT NOT NULL DEFAULT '',
    "style" "WritingStyle" NOT NULL DEFAULT 'mixed',
    "emojiUsage" "EmojiUsage" NOT NULL DEFAULT 'light',
    "samplePosts" TEXT[],
    "styleDiscoveryAnswers" JSONB,
    "onboardingMethod" "OnboardingMethod" NOT NULL DEFAULT 'sample_posts',
    "generatedProfile" TEXT NOT NULL DEFAULT '',
    "preferredLanguage" "Language" NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingDNA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "structure" "PostStructure" NOT NULL,
    "language" "Language" NOT NULL,
    "chainContext" JSONB NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "status" "WhatsAppStatus" NOT NULL DEFAULT 'pending',
    "verificationCode" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomingMessage" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "providerMessageId" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "bodyText" TEXT,
    "mediaUrl" TEXT,
    "transcription" TEXT,
    "generatedPostId" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'received',
    "errorReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncomingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refinement" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" "RefinementType" NOT NULL,
    "customInstruction" TEXT,
    "output" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refinement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneE164_key" ON "User"("phoneE164");

-- CreateIndex
CREATE UNIQUE INDEX "WritingDNA_userId_key" ON "WritingDNA"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppConnection_userId_key" ON "WhatsAppConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppConnection_phoneE164_key" ON "WhatsAppConnection"("phoneE164");

-- CreateIndex
CREATE UNIQUE INDEX "IncomingMessage_providerMessageId_key" ON "IncomingMessage"("providerMessageId");

-- CreateIndex
CREATE INDEX "IncomingMessage_connectionId_createdAt_idx" ON "IncomingMessage"("connectionId", "createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingDNA" ADD CONSTRAINT "WritingDNA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppConnection" ADD CONSTRAINT "WhatsAppConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingMessage" ADD CONSTRAINT "IncomingMessage_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "WhatsAppConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingMessage" ADD CONSTRAINT "IncomingMessage_generatedPostId_fkey" FOREIGN KEY ("generatedPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refinement" ADD CONSTRAINT "Refinement_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
