/*
  Warnings:

  - The values [REVIEWED,DISMISSED] on the enum `ReportStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [REGISTRATION] on the enum `TournamentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `condition` on the `achievements` table. All the data in the column will be lost.
  - You are about to drop the column `icon_url` on the `achievements` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `achievements` table. All the data in the column will be lost.
  - You are about to drop the column `sort_order` on the `achievements` table. All the data in the column will be lost.
  - You are about to drop the column `match` on the `brackets` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `payouts` table. All the data in the column will be lost.
  - You are about to drop the column `battles_won` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `quests_solved` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `rank_id` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `streaks` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `eliminated` on the `tournament_participants` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `tournament_participants` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `tournament_participants` table. All the data in the column will be lost.
  - The primary key for the `tournament_registrations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `registered_at` on the `tournament_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `tournament_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `prize` on the `tournament_results` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `tournament_results` table. All the data in the column will be lost.
  - You are about to drop the column `xp_earned` on the `tournament_results` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `ends_at` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `max_participants` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `rules` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `starts_at` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `tournaments` table. All the data in the column will be lost.
  - You are about to alter the column `entry_fee` on the `tournaments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - The primary key for the `user_achievements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `user_achievements` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `user_rank_history` table. All the data in the column will be lost.
  - The primary key for the `user_titles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `user_titles` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `banner_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `coins` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_banned` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_online` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `major` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profile_completed` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `provider_email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `xp_logs` table. All the data in the column will be lost.
  - You are about to drop the `activity_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coins_transactions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `achievements` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profile_id,type]` on the table `streaks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tournament_id,profile_id]` on the table `tournament_participants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tournament_id,profile_id]` on the table `tournament_registrations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `achievements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `achievements` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `admin_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `reason` on table `admin_actions` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `match_number` to the `brackets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `profile_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `payouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `streaks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `tournament_participants` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `tournament_registrations` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `profile_id` to the `tournament_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `tournament_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Made the column `entry_fee` on table `tournaments` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `profile_id` to the `user_achievements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `user_rank_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `user_titles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `xp_logs` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `source` on the `xp_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "FollowStatus" AS ENUM ('FOLLOWING', 'REQUESTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('UNIVERSITY', 'COMPANY', 'BOOTCAMP');

-- CreateEnum
CREATE TYPE "OrgMemberRole" AS ENUM ('STUDENT', 'FACULTY', 'EMPLOYEE', 'MEMBER');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('STUDENT', 'PROFESSIONAL', 'OPEN_SOURCE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('COMMUNITY', 'QUESTS', 'BATTLES', 'TOURNAMENTS', 'OPEN_SOURCE', 'SOCIAL');

-- CreateEnum
CREATE TYPE "AchievementRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PostType" ADD VALUE 'PROJECT_SHOWCASE';
ALTER TYPE "PostType" ADD VALUE 'DISCUSSION';

-- AlterEnum
BEGIN;
CREATE TYPE "ReportStatus_new" AS ENUM ('OPEN', 'RESOLVED', 'REJECTED');
ALTER TABLE "reports" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "reports" ALTER COLUMN "status" TYPE "ReportStatus_new" USING ("status"::text::"ReportStatus_new");
ALTER TYPE "ReportStatus" RENAME TO "ReportStatus_old";
ALTER TYPE "ReportStatus_new" RENAME TO "ReportStatus";
DROP TYPE "ReportStatus_old";
ALTER TABLE "reports" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TournamentStatus_new" AS ENUM ('UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "tournaments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "tournaments" ALTER COLUMN "status" TYPE "TournamentStatus_new" USING ("status"::text::"TournamentStatus_new");
ALTER TYPE "TournamentStatus" RENAME TO "TournamentStatus_old";
ALTER TYPE "TournamentStatus_new" RENAME TO "TournamentStatus";
DROP TYPE "TournamentStatus_old";
ALTER TABLE "tournaments" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
COMMIT;

-- DropForeignKey
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "admin_actions" DROP CONSTRAINT "admin_actions_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "admin_actions" DROP CONSTRAINT "admin_actions_target_user_id_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "battle_players" DROP CONSTRAINT "battle_players_user_id_fkey";

-- DropForeignKey
ALTER TABLE "battle_submissions" DROP CONSTRAINT "battle_submissions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "coins_transactions" DROP CONSTRAINT "coins_transactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_author_id_fkey";

-- DropForeignKey
ALTER TABLE "conversation_participants" DROP CONSTRAINT "conversation_participants_user_id_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_follower_id_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_following_id_fkey";

-- DropForeignKey
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_addressee_id_fkey";

-- DropForeignKey
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_requester_id_fkey";

-- DropForeignKey
ALTER TABLE "matchmaking_queue" DROP CONSTRAINT "matchmaking_queue_user_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payouts" DROP CONSTRAINT "payouts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_rank_id_fkey";

-- DropForeignKey
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_reporter_id_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_reviewed_by_fkey";

-- DropForeignKey
ALTER TABLE "saved_posts" DROP CONSTRAINT "saved_posts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "streaks" DROP CONSTRAINT "streaks_user_id_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_participants" DROP CONSTRAINT "tournament_participants_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_registrations" DROP CONSTRAINT "tournament_registrations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tournament_results" DROP CONSTRAINT "tournament_results_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_achievement_id_fkey";

-- DropForeignKey
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_rank_history" DROP CONSTRAINT "user_rank_history_rank_id_fkey";

-- DropForeignKey
ALTER TABLE "user_rank_history" DROP CONSTRAINT "user_rank_history_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_titles" DROP CONSTRAINT "user_titles_title_id_fkey";

-- DropForeignKey
ALTER TABLE "user_titles" DROP CONSTRAINT "user_titles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "xp_logs" DROP CONSTRAINT "xp_logs_user_id_fkey";

-- DropIndex
DROP INDEX "achievements_name_key";

-- DropIndex
DROP INDEX "admin_actions_admin_id_created_at_idx";

-- DropIndex
DROP INDEX "admin_actions_target_user_id_idx";

-- DropIndex
DROP INDEX "notifications_user_id_is_read_created_at_idx";

-- DropIndex
DROP INDEX "payments_user_id_created_at_idx";

-- DropIndex
DROP INDEX "payouts_user_id_created_at_idx";

-- DropIndex
DROP INDEX "profiles_rank_id_idx";

-- DropIndex
DROP INDEX "reports_status_created_at_idx";

-- DropIndex
DROP INDEX "streaks_user_id_type_key";

-- DropIndex
DROP INDEX "subscriptions_user_id_status_idx";

-- DropIndex
DROP INDEX "tournament_participants_tournament_id_user_id_key";

-- DropIndex
DROP INDEX "tournament_results_tournament_id_position_idx";

-- DropIndex
DROP INDEX "tournament_results_tournament_id_user_id_key";

-- DropIndex
DROP INDEX "tournaments_status_starts_at_idx";

-- DropIndex
DROP INDEX "tournaments_type_idx";

-- DropIndex
DROP INDEX "user_rank_history_user_id_changed_at_idx";

-- DropIndex
DROP INDEX "users_level_idx";

-- DropIndex
DROP INDEX "users_username_key";

-- DropIndex
DROP INDEX "users_xp_idx";

-- DropIndex
DROP INDEX "xp_logs_user_id_created_at_idx";

-- AlterTable
ALTER TABLE "achievements" DROP COLUMN "condition",
DROP COLUMN "icon_url",
DROP COLUMN "is_active",
DROP COLUMN "sort_order",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "rarity" "AchievementRarity" NOT NULL DEFAULT 'COMMON',
ADD COLUMN     "reputation_reward" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" VARCHAR(100) NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" "AchievementCategory" NOT NULL;

-- AlterTable
ALTER TABLE "admin_actions" DROP COLUMN "action",
ADD COLUMN     "action" VARCHAR(50) NOT NULL,
ALTER COLUMN "reason" SET NOT NULL;

-- AlterTable
ALTER TABLE "brackets" DROP COLUMN "match",
ADD COLUMN     "match_number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "follows" ADD COLUMN     "status" "FollowStatus" NOT NULL DEFAULT 'FOLLOWING';

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "user_id",
ADD COLUMN     "profile_id" UUID NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" VARCHAR(50) NOT NULL,
ALTER COLUMN "link" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "user_id",
ADD COLUMN     "profile_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "payouts" DROP COLUMN "user_id",
ADD COLUMN     "profile_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "battles_won",
DROP COLUMN "quests_solved",
DROP COLUMN "rank_id",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "banner" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "country" VARCHAR(100),
ADD COLUMN     "current_xp" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "github_url" TEXT,
ADD COLUMN     "github_username" VARCHAR(100),
ADD COLUMN     "graduation_year" INTEGER,
ADD COLUMN     "is_online" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "linkedin_url" TEXT,
ADD COLUMN     "major" VARCHAR(100),
ADD COLUMN     "portfolio_url" TEXT,
ADD COLUMN     "profile_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "region" VARCHAR(100),
ADD COLUMN     "reputation" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_xp" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "university" VARCHAR(100),
ADD COLUMN     "username" VARCHAR(50) NOT NULL,
ADD COLUMN     "website_url" TEXT;

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "details",
DROP COLUMN "targetType";

-- AlterTable
ALTER TABLE "streaks" DROP COLUMN "user_id",
ADD COLUMN     "profile_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "user_id",
ADD COLUMN     "profile_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "tournament_participants" DROP COLUMN "eliminated",
DROP COLUMN "score",
DROP COLUMN "user_id",
ADD COLUMN     "profile_id" UUID NOT NULL,
ADD COLUMN     "rank" INTEGER,
ADD COLUMN     "seed" INTEGER;

-- AlterTable
ALTER TABLE "tournament_registrations" DROP CONSTRAINT "tournament_registrations_pkey",
DROP COLUMN "registered_at",
DROP COLUMN "user_id",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" UUID NOT NULL,
ADD COLUMN     "profile_id" UUID NOT NULL,
ADD COLUMN     "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
ADD CONSTRAINT "tournament_registrations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tournament_results" DROP COLUMN "prize",
DROP COLUMN "user_id",
DROP COLUMN "xp_earned",
ADD COLUMN     "prize_won" TEXT,
ADD COLUMN     "profile_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "tournaments" DROP COLUMN "created_at",
DROP COLUMN "ends_at",
DROP COLUMN "max_participants",
DROP COLUMN "name",
DROP COLUMN "rules",
DROP COLUMN "starts_at",
DROP COLUMN "type",
ADD COLUMN     "end_date" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "start_date" TIMESTAMPTZ NOT NULL,
ADD COLUMN     "title" VARCHAR(255) NOT NULL,
ALTER COLUMN "entry_fee" SET NOT NULL,
ALTER COLUMN "entry_fee" SET DEFAULT 0,
ALTER COLUMN "entry_fee" SET DATA TYPE INTEGER,
ALTER COLUMN "prize_pool" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "profile_id" UUID NOT NULL,
ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("profile_id", "achievement_id");

-- AlterTable
ALTER TABLE "user_rank_history" DROP COLUMN "user_id",
ADD COLUMN     "profile_id" UUID NOT NULL,
ALTER COLUMN "rank_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_titles" DROP CONSTRAINT "user_titles_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "profile_id" UUID NOT NULL,
ADD CONSTRAINT "user_titles_pkey" PRIMARY KEY ("profile_id", "title_id");

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar_url",
DROP COLUMN "banner_url",
DROP COLUMN "bio",
DROP COLUMN "coins",
DROP COLUMN "is_banned",
DROP COLUMN "is_online",
DROP COLUMN "is_verified",
DROP COLUMN "level",
DROP COLUMN "major",
DROP COLUMN "profile_completed",
DROP COLUMN "provider_email",
DROP COLUMN "region",
DROP COLUMN "username",
DROP COLUMN "xp",
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL';

-- AlterTable
ALTER TABLE "xp_logs" DROP COLUMN "user_id",
ADD COLUMN     "profile_id" UUID NOT NULL,
DROP COLUMN "source",
ADD COLUMN     "source" VARCHAR(50) NOT NULL,
ALTER COLUMN "description" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "activity_logs";

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "coins_transactions";

-- DropEnum
DROP TYPE "AdminActionType";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "ReportTarget";

-- DropEnum
DROP TYPE "TournamentType";

-- DropEnum
DROP TYPE "XpSource";

-- CreateTable
CREATE TABLE "permissions" (
    "id" VARCHAR(50) NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "user_id" UUID NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("user_id","permission_id")
);

-- CreateTable
CREATE TABLE "skill_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skills" (
    "profile_id" UUID NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "level" "ProficiencyLevel" NOT NULL DEFAULT 'BEGINNER',
    "years_experience" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("profile_id","skill_id")
);

-- CreateTable
CREATE TABLE "developer_circles" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "color" VARCHAR(7),

    CONSTRAINT "developer_circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "circle_members" (
    "circle_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,

    CONSTRAINT "circle_members_pkey" PRIMARY KEY ("circle_id","profile_id")
);

-- CreateTable
CREATE TABLE "rank_history" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "old_rank" TEXT NOT NULL,
    "new_rank" TEXT NOT NULL,
    "old_rating" INTEGER NOT NULL,
    "new_rating" INTEGER NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rank_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_reputation" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "contribution" INTEGER NOT NULL DEFAULT 0,
    "mentorship" INTEGER NOT NULL DEFAULT 0,
    "sportsmanship" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profile_reputation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "logo" TEXT,
    "country" VARCHAR(100),
    "type" "OrgType" NOT NULL,
    "description" TEXT,
    "website_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "organization_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "role" "OrgMemberRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("organization_id","profile_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "avatar" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "team_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("team_id","profile_id")
);

-- CreateTable
CREATE TABLE "team_invites" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "inviter_id" UUID NOT NULL,
    "invitee_id" UUID NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "evidence" JSONB,
    "admin_note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_transactions" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" BIGINT NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "reference_type" VARCHAR(50),
    "reference_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_name_key" ON "skill_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE INDEX "rank_history_profile_id_created_at_idx" ON "rank_history"("profile_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "profile_reputation_profile_id_key" ON "profile_reputation"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");

-- CreateIndex
CREATE INDEX "team_invites_invitee_id_idx" ON "team_invites"("invitee_id");

-- CreateIndex
CREATE INDEX "verification_requests_status_idx" ON "verification_requests"("status");

-- CreateIndex
CREATE INDEX "coin_transactions_profile_id_created_at_idx" ON "coin_transactions"("profile_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_slug_key" ON "achievements"("slug");

-- CreateIndex
CREATE INDEX "notifications_profile_id_created_at_idx" ON "notifications"("profile_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "payments_profile_id_created_at_idx" ON "payments"("profile_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "payouts_profile_id_created_at_idx" ON "payouts"("profile_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE INDEX "profiles_username_idx" ON "profiles"("username");

-- CreateIndex
CREATE INDEX "profiles_level_idx" ON "profiles"("level");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_profile_id_type_key" ON "streaks"("profile_id", "type");

-- CreateIndex
CREATE INDEX "subscriptions_profile_id_status_idx" ON "subscriptions"("profile_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_participants_tournament_id_profile_id_key" ON "tournament_participants"("tournament_id", "profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_registrations_tournament_id_profile_id_key" ON "tournament_registrations"("tournament_id", "profile_id");

-- CreateIndex
CREATE INDEX "user_rank_history_profile_id_changed_at_idx" ON "user_rank_history"("profile_id", "changed_at" DESC);

-- CreateIndex
CREATE INDEX "xp_logs_profile_id_created_at_idx" ON "xp_logs"("profile_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "skill_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer_circles" ADD CONSTRAINT "developer_circles_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_circle_id_fkey" FOREIGN KEY ("circle_id") REFERENCES "developer_circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battles" ADD CONSTRAINT "battles_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_players" ADD CONSTRAINT "battle_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_submissions" ADD CONSTRAINT "battle_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchmaking_queue" ADD CONSTRAINT "matchmaking_queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_history" ADD CONSTRAINT "rank_history_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_registrations" ADD CONSTRAINT "tournament_registrations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_reputation" ADD CONSTRAINT "profile_reputation_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "battles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_title_id_fkey" FOREIGN KEY ("title_id") REFERENCES "titles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_logs" ADD CONSTRAINT "xp_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rank_history" ADD CONSTRAINT "user_rank_history_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rank_history" ADD CONSTRAINT "user_rank_history_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "ranks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
