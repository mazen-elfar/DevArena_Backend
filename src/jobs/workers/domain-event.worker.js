import { Worker } from "bullmq";
import { getRedis } from "../../config/redis.js";
import { getPrisma } from "../../config/database.js";

/**
 * DomainEventWorker
 * Processes events from the 'domain-events' queue.
 * Coordinates updates across Reputation, XP, Achievements, and Notifications.
 */
export function setupDomainEventWorker() {
  const connection = getRedis();
  const prisma = getPrisma();

  const worker = new Worker("domain-events", async (job) => {
    const { eventType, payload, timestamp } = job.data;
    console.log(`[DomainEventWorker] Processing ${eventType}`, payload);

    try {
      switch (eventType) {
        case "BATTLE_WON":
          await handleBattleWon(prisma, payload);
          break;
        case "QUEST_COMPLETED":
          await handleQuestCompleted(prisma, payload);
          break;
        case "LEVEL_UP":
          await handleLevelUp(prisma, payload);
          break;
        default:
          console.warn(`[DomainEventWorker] Unhandled event type: ${eventType}`);
      }
    } catch (error) {
      console.error(`[DomainEventWorker] Error processing ${eventType}:`, error.message);
      throw error; // Re-throw to trigger BullMQ retry
    }
  }, { connection });

  worker.on("completed", (job) => {
    console.log(`[DomainEventWorker] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[DomainEventWorker] Job ${job.id} failed:`, err.message);
  });

  return worker;
}

/**
 * Handle BATTLE_WON event.
 * Updates battle reputation, adds XP, and checks for rank progression.
 */
async function handleBattleWon(prisma, { profileId, battleId, ratingChange }) {
  // 1. Log XP
  await prisma.xpLog.create({
    data: {
      profileId,
      amount: 150, // Standard win XP
      source: "BATTLE_WIN",
      sourceId: battleId,
      description: "Won a battle"
    }
  });

  // 2. Update Reputation
  await prisma.reputation.upsert({
    where: { profileId },
    update: {
      battleScore: { increment: 10 },
      totalScore: { increment: 10 }
    },
    create: {
      profileId,
      battleScore: 10,
      totalScore: 10
    }
  });

  // 3. Update Profile Stats
  await prisma.profile.update({
    where: { id: profileId },
    data: {
      xp: { increment: 150 },
      totalWins: { increment: 1 },
      rating: { increment: ratingChange || 20 }
    }
  });
  
  // 4. Trigger Achievement Check (Future)
}

async function handleQuestCompleted(prisma, { profileId, questId, rewards }) {
  // Logic for quest completion (XP, Rep, Coins)
}

async function handleLevelUp(prisma, { profileId, newLevel }) {
  // Trigger Level Up notification and rewards
}
