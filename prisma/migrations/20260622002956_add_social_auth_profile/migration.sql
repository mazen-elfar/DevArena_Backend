-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'GITHUB');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('TEXT', 'ACHIEVEMENT', 'BATTLE_RESULT', 'QUEST_COMPLETION', 'TOURNAMENT_RESULT');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'LOVE', 'FIRE', 'MIND_BLOWN', 'ROCKET');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "QuestDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "ProgrammingLanguage" AS ENUM ('JAVASCRIPT', 'TYPESCRIPT', 'PYTHON', 'JAVA', 'CPP', 'CSHARP', 'GO');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED', 'COMPILATION_ERROR', 'MEMORY_LIMIT_EXCEEDED');

-- CreateEnum
CREATE TYPE "BattleMode" AS ENUM ('RANKED', 'CLASSIC', 'FRIEND', 'AI');

-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AiDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "MatchmakingStatus" AS ENUM ('QUEUED', 'MATCHED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TournamentType" AS ENUM ('WEEKLY', 'SEASONAL');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('UPCOMING', 'REGISTRATION', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BracketStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "XpSource" AS ENUM ('QUEST', 'BATTLE', 'TOURNAMENT', 'DAILY', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "TitleRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "StreakType" AS ENUM ('DAILY_LOGIN', 'DAILY_QUEST', 'DAILY_BATTLE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'BATTLE_INVITE', 'BATTLE_RESULT', 'QUEST_COMPLETED', 'NEW_ACHIEVEMENT', 'TOURNAMENT_REMINDER', 'RANK_PROMOTION', 'NEW_MESSAGE', 'ADMIN_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('TOURNAMENT_ENTRY', 'SUBSCRIPTION', 'STORE_PURCHASE', 'PRIZE_PAYOUT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('BANK', 'PAYPAL', 'CRYPTO');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReportTarget" AS ENUM ('POST', 'COMMENT', 'USER', 'MESSAGE');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "AdminActionType" AS ENUM ('SUSPEND', 'BAN', 'MUTE', 'WARN', 'DEMOTE', 'PROMOTE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "avatar_url" TEXT,
    "banner_url" TEXT,
    "bio" TEXT,
    "region" VARCHAR(100),
    "major" VARCHAR(100),
    "xp" BIGINT NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "coins" BIGINT NOT NULL DEFAULT 0,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "provider_email" VARCHAR(255),
    "profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "user_providers" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "provider_uid" VARCHAR(255) NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "last_login_at" TIMESTAMPTZ,
    "linked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name" VARCHAR(100),
    "rank_id" INTEGER,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "quests_solved" INTEGER NOT NULL DEFAULT 0,
    "battles_won" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "type" "PostType" NOT NULL DEFAULT 'TEXT',
    "title" VARCHAR(255),
    "content" TEXT NOT NULL,
    "reaction_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "save_count" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "parent_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "user_id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "type" "ReactionType" NOT NULL DEFAULT 'LIKE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("user_id","post_id")
);

-- CreateTable
CREATE TABLE "saved_posts" (
    "user_id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_posts_pkey" PRIMARY KEY ("user_id","post_id")
);

-- CreateTable
CREATE TABLE "follows" (
    "follower_id" UUID NOT NULL,
    "following_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("follower_id","following_id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" UUID NOT NULL,
    "requester_id" UUID NOT NULL,
    "addressee_id" UUID NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMPTZ,
    "is_muted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "slug" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quest_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" UUID NOT NULL,
    "category_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "QuestDifficulty" NOT NULL,
    "xp_reward" INTEGER NOT NULL,
    "coins_reward" INTEGER NOT NULL DEFAULT 0,
    "examples" JSONB,
    "constraints" TEXT,
    "test_template" TEXT,
    "time_limit_ms" INTEGER NOT NULL DEFAULT 5000,
    "memory_limit_mb" INTEGER NOT NULL DEFAULT 256,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_cases" (
    "id" UUID NOT NULL,
    "quest_id" UUID NOT NULL,
    "input_data" TEXT NOT NULL,
    "expected_output" TEXT NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "quest_id" UUID NOT NULL,
    "language" "ProgrammingLanguage" NOT NULL,
    "source_code" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "runtime_ms" INTEGER,
    "memory_kb" INTEGER,
    "test_results" JSONB,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battles" (
    "id" UUID NOT NULL,
    "mode" "BattleMode" NOT NULL,
    "quest_id" UUID NOT NULL,
    "status" "BattleStatus" NOT NULL DEFAULT 'WAITING',
    "winner_id" UUID,
    "ai_difficulty" "AiDifficulty",
    "time_limit_sec" INTEGER NOT NULL DEFAULT 300,
    "started_at" TIMESTAMPTZ,
    "ended_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_players" (
    "id" UUID NOT NULL,
    "battle_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_winner" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battle_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_submissions" (
    "id" UUID NOT NULL,
    "battle_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "source_code" TEXT NOT NULL,
    "language" "ProgrammingLanguage" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "runtime_ms" INTEGER,
    "test_results" JSONB,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battle_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matchmaking_queue" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "status" "MatchmakingStatus" NOT NULL DEFAULT 'QUEUED',
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matchmaking_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranks" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "min_rating" INTEGER NOT NULL,
    "max_rating" INTEGER NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "icon_url" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ranks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_rank_history" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rank_id" INTEGER NOT NULL,
    "old_rating" INTEGER NOT NULL,
    "new_rating" INTEGER NOT NULL,
    "changed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_rank_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "TournamentType" NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'UPCOMING',
    "max_participants" INTEGER,
    "entry_fee" DECIMAL(10,2),
    "prize_pool" DECIMAL(12,2),
    "description" TEXT,
    "rules" TEXT,
    "starts_at" TIMESTAMPTZ NOT NULL,
    "ends_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_registrations" (
    "tournament_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "registered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_registrations_pkey" PRIMARY KEY ("tournament_id","user_id")
);

-- CreateTable
CREATE TABLE "tournament_participants" (
    "id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "eliminated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tournament_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_results" (
    "id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "prize" DECIMAL(10,2),
    "xp_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tournament_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brackets" (
    "id" UUID NOT NULL,
    "tournament_id" UUID NOT NULL,
    "round" INTEGER NOT NULL,
    "match" INTEGER NOT NULL,
    "player1_id" UUID,
    "player2_id" UUID,
    "winner_id" UUID,
    "battle_id" UUID,
    "status" "BracketStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "brackets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" "XpSource" NOT NULL,
    "description" VARCHAR(255),
    "reference_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "icon_url" TEXT,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "category" VARCHAR(50),
    "condition" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "user_id" UUID NOT NULL,
    "achievement_id" INTEGER NOT NULL,
    "unlocked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("user_id","achievement_id")
);

-- CreateTable
CREATE TABLE "titles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "rarity" "TitleRarity" NOT NULL DEFAULT 'COMMON',

    CONSTRAINT "titles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_titles" (
    "user_id" UUID NOT NULL,
    "title_id" INTEGER NOT NULL,
    "equipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_titles_pkey" PRIMARY KEY ("user_id","title_id")
);

-- CreateTable
CREATE TABLE "streaks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "StreakType" NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" DATE NOT NULL,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coins_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" BIGINT NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "reference_type" VARCHAR(50),
    "reference_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coins_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "link" VARCHAR(500),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transaction_ref" VARCHAR(255),
    "gateway" VARCHAR(50),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PayoutMethod",
    "account_ref" VARCHAR(255),
    "verified_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "starts_at" TIMESTAMPTZ NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "reporter_id" UUID NOT NULL,
    "targetType" "ReportTarget" NOT NULL,
    "target_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "reviewed_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" INET,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_actions" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "target_user_id" UUID NOT NULL,
    "action" "AdminActionType" NOT NULL,
    "reason" TEXT,
    "duration_hours" INTEGER,
    "expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(255) NOT NULL,
    "entity_type" VARCHAR(50),
    "entity_id" UUID,
    "metadata" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_level_idx" ON "users"("level");

-- CreateIndex
CREATE INDEX "users_xp_idx" ON "users"("xp");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "user_providers_user_id_idx" ON "user_providers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_providers_provider_provider_uid_key" ON "user_providers"("provider", "provider_uid");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "profiles_rating_idx" ON "profiles"("rating");

-- CreateIndex
CREATE INDEX "profiles_rank_id_idx" ON "profiles"("rank_id");

-- CreateIndex
CREATE INDEX "posts_author_id_idx" ON "posts"("author_id");

-- CreateIndex
CREATE INDEX "posts_created_at_idx" ON "posts"("created_at" DESC);

-- CreateIndex
CREATE INDEX "posts_type_idx" ON "posts"("type");

-- CreateIndex
CREATE INDEX "comments_post_id_created_at_idx" ON "comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "comments_author_id_idx" ON "comments"("author_id");

-- CreateIndex
CREATE INDEX "friendships_addressee_id_status_idx" ON "friendships"("addressee_id", "status");

-- CreateIndex
CREATE INDEX "friendships_requester_id_status_idx" ON "friendships"("requester_id", "status");

-- CreateIndex
CREATE INDEX "conversation_participants_user_id_idx" ON "conversation_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE UNIQUE INDEX "quest_categories_name_key" ON "quest_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "quest_categories_slug_key" ON "quest_categories"("slug");

-- CreateIndex
CREATE INDEX "quests_category_id_difficulty_idx" ON "quests"("category_id", "difficulty");

-- CreateIndex
CREATE INDEX "quests_difficulty_idx" ON "quests"("difficulty");

-- CreateIndex
CREATE INDEX "quests_is_active_idx" ON "quests"("is_active");

-- CreateIndex
CREATE INDEX "test_cases_quest_id_idx" ON "test_cases"("quest_id");

-- CreateIndex
CREATE INDEX "submissions_user_id_quest_id_idx" ON "submissions"("user_id", "quest_id");

-- CreateIndex
CREATE INDEX "submissions_quest_id_status_idx" ON "submissions"("quest_id", "status");

-- CreateIndex
CREATE INDEX "submissions_submitted_at_idx" ON "submissions"("submitted_at" DESC);

-- CreateIndex
CREATE INDEX "battles_status_idx" ON "battles"("status");

-- CreateIndex
CREATE INDEX "battles_mode_idx" ON "battles"("mode");

-- CreateIndex
CREATE INDEX "battles_created_at_idx" ON "battles"("created_at" DESC);

-- CreateIndex
CREATE INDEX "battle_players_user_id_idx" ON "battle_players"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "battle_players_battle_id_user_id_key" ON "battle_players"("battle_id", "user_id");

-- CreateIndex
CREATE INDEX "battle_submissions_battle_id_idx" ON "battle_submissions"("battle_id");

-- CreateIndex
CREATE INDEX "battle_submissions_user_id_idx" ON "battle_submissions"("user_id");

-- CreateIndex
CREATE INDEX "matchmaking_queue_status_rating_idx" ON "matchmaking_queue"("status", "rating");

-- CreateIndex
CREATE INDEX "matchmaking_queue_user_id_idx" ON "matchmaking_queue"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ranks_name_key" ON "ranks"("name");

-- CreateIndex
CREATE INDEX "ranks_min_rating_max_rating_idx" ON "ranks"("min_rating", "max_rating");

-- CreateIndex
CREATE INDEX "user_rank_history_user_id_changed_at_idx" ON "user_rank_history"("user_id", "changed_at" DESC);

-- CreateIndex
CREATE INDEX "tournaments_status_starts_at_idx" ON "tournaments"("status", "starts_at");

-- CreateIndex
CREATE INDEX "tournaments_type_idx" ON "tournaments"("type");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_participants_tournament_id_user_id_key" ON "tournament_participants"("tournament_id", "user_id");

-- CreateIndex
CREATE INDEX "tournament_results_tournament_id_position_idx" ON "tournament_results"("tournament_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_results_tournament_id_user_id_key" ON "tournament_results"("tournament_id", "user_id");

-- CreateIndex
CREATE INDEX "brackets_tournament_id_round_idx" ON "brackets"("tournament_id", "round");

-- CreateIndex
CREATE INDEX "xp_logs_user_id_created_at_idx" ON "xp_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_key" ON "achievements"("name");

-- CreateIndex
CREATE UNIQUE INDEX "titles_name_key" ON "titles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_user_id_type_key" ON "streaks"("user_id", "type");

-- CreateIndex
CREATE INDEX "coins_transactions_user_id_created_at_idx" ON "coins_transactions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at" DESC);

-- CreateIndex
CREATE INDEX "payments_user_id_created_at_idx" ON "payments"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payouts_user_id_created_at_idx" ON "payouts"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "subscriptions_user_id_status_idx" ON "subscriptions"("user_id", "status");

-- CreateIndex
CREATE INDEX "reports_status_created_at_idx" ON "reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_admin_id_created_at_idx" ON "audit_logs"("admin_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "admin_actions_admin_id_created_at_idx" ON "admin_actions"("admin_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "admin_actions_target_user_id_idx" ON "admin_actions"("target_user_id");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_providers" ADD CONSTRAINT "user_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "ranks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "quest_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battles" ADD CONSTRAINT "battles_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_players" ADD CONSTRAINT "battle_players_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "battles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_players" ADD CONSTRAINT "battle_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_submissions" ADD CONSTRAINT "battle_submissions_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "battles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_submissions" ADD CONSTRAINT "battle_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchmaking_queue" ADD CONSTRAINT "matchmaking_queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rank_history" ADD CONSTRAINT "user_rank_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rank_history" ADD CONSTRAINT "user_rank_history_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "ranks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_registrations" ADD CONSTRAINT "tournament_registrations_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_registrations" ADD CONSTRAINT "tournament_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_logs" ADD CONSTRAINT "xp_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_title_id_fkey" FOREIGN KEY ("title_id") REFERENCES "titles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coins_transactions" ADD CONSTRAINT "coins_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
