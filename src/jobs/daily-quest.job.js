import { getPrisma } from "../config/database.js";
import { getRedis } from "../config/redis.js";

export function setupDailyQuestWorker() {
  // Run daily at midnight UTC
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0);
  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(async () => {
    await rotateDailyQuest();
    // Then run every 24 hours
    setInterval(rotateDailyQuest, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
}

async function rotateDailyQuest() {
  try {
    const prisma = getPrisma();
    const redis = getRedis();

    // Select a random active quest
    const quests = await prisma.quest.findMany({
      where: { isActive: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    if (quests.length > 0) {
      const randomQuest = quests[Math.floor(Math.random() * quests.length)];
      await redis.setex("daily:quest", 24 * 60 * 60, randomQuest.id);
      console.log(`[DailyQuest] Rotated to quest: ${randomQuest.title}`);
    }
  } catch (error) {
    console.error("[DailyQuest] Error:", error.message);
  }
}
