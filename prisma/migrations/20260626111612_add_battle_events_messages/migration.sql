-- CreateTable
CREATE TABLE "battle_events" (
    "id" UUID NOT NULL,
    "battle_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "user_id" UUID,
    "data" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battle_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_messages" (
    "id" UUID NOT NULL,
    "battle_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battle_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "battle_events_battle_id_created_at_idx" ON "battle_events"("battle_id", "created_at");

-- CreateIndex
CREATE INDEX "battle_messages_battle_id_created_at_idx" ON "battle_messages"("battle_id", "created_at");

-- CreateIndex
CREATE INDEX "battle_submissions_battle_id_user_id_idx" ON "battle_submissions"("battle_id", "user_id");

-- CreateIndex
CREATE INDEX "battles_quest_id_idx" ON "battles"("quest_id");

-- CreateIndex
CREATE INDEX "battles_winner_id_idx" ON "battles"("winner_id");

-- AddForeignKey
ALTER TABLE "battle_events" ADD CONSTRAINT "battle_events_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "battles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_events" ADD CONSTRAINT "battle_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_messages" ADD CONSTRAINT "battle_messages_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "battles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_messages" ADD CONSTRAINT "battle_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
