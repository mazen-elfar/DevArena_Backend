import { getPrisma } from "../../config/database.js";

const prisma = getPrisma();

const roles = [
  { id: 1, name: "user", description: "Regular user" },
  { id: 2, name: "moderator", description: "Content moderator" },
  { id: 3, name: "admin", description: "Platform administrator" },
  { id: 4, name: "super_admin", description: "Super administrator" },
];

const ranks = [
  { name: "Bronze", minRating: 0, maxRating: 999, color: "#CD7F32", order: 1 },
  { name: "Silver", minRating: 1000, maxRating: 1499, color: "#C0C0C0", order: 2 },
  { name: "Gold", minRating: 1500, maxRating: 1999, color: "#FFD700", order: 3 },
  { name: "Platinum", minRating: 2000, maxRating: 2499, color: "#E5E4E2", order: 4 },
  { name: "Diamond", minRating: 2500, maxRating: 2999, color: "#B9F2FF", order: 5 },
  { name: "Emerald", minRating: 3000, maxRating: 3499, color: "#50C878", order: 6 },
  { name: "Ruby", minRating: 3500, maxRating: 3999, color: "#E0115F", order: 7 },
  { name: "Master", minRating: 4000, maxRating: 4499, color: "#FF6B6B", order: 8 },
  { name: "Grandmaster", minRating: 4500, maxRating: 4999, color: "#FFD700", order: 9 },
  { name: "Challenger", minRating: 5000, maxRating: 99999, color: "#FF4500", order: 10 },
];

const achievements = [
  { name: "First Blood", description: "Solve your first quest", xpReward: 100, category: "quest", condition: { type: "quests_solved", count: 1 } },
  { name: "Speed Demon", description: "Solve a quest in under 1 second", xpReward: 200, category: "quest", condition: { type: "quest_speed", under_ms: 1000 } },
  { name: "Battle Novice", description: "Win your first battle", xpReward: 150, category: "battle", condition: { type: "battles_won", count: 1 } },
  { name: "Battle Master", description: "Win 10 battles", xpReward: 500, category: "battle", condition: { type: "battles_won", count: 10 } },
  { name: "Social Butterfly", description: "Add 5 friends", xpReward: 100, category: "social", condition: { type: "friends_count", count: 5 } },
  { name: "Streak Master", description: "Maintain a 7-day streak", xpReward: 300, category: "streak", condition: { type: "streak_days", count: 7 } },
  { name: "Tournament Champion", description: "Win a tournament", xpReward: 1000, category: "tournament", condition: { type: "tournaments_won", count: 1 } },
  { name: "Code Warrior", description: "Solve 50 quests", xpReward: 2000, category: "quest", condition: { type: "quests_solved", count: 50 } },
];

const titles = [
  { name: "Newbie", rarity: "COMMON" },
  { name: "Code Warrior", rarity: "COMMON" },
  { name: "Quest Hunter", rarity: "RARE" },
  { name: "Battle Champion", rarity: "RARE" },
  { name: "Tournament Master", rarity: "EPIC" },
  { name: "Grandmaster", rarity: "EPIC" },
  { name: "Legend", rarity: "LEGENDARY" },
  { name: "DevArena Champion", rarity: "LEGENDARY" },
];

const questCategories = [
  { name: "Algorithms", slug: "algorithms", description: "Algorithmic problem solving", sortOrder: 1 },
  { name: "Data Structures", slug: "data-structures", description: "Data structure implementation", sortOrder: 2 },
  { name: "String Manipulation", slug: "strings", description: "String processing challenges", sortOrder: 3 },
  { name: "Mathematics", slug: "math", description: "Mathematical problems", sortOrder: 4 },
  { name: "Dynamic Programming", slug: "dp", description: "Dynamic programming challenges", sortOrder: 5 },
  { name: "Graph Theory", slug: "graphs", description: "Graph algorithm challenges", sortOrder: 6 },
];

async function seed() {
  console.log("Seeding database...");

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }
  console.log("✓ Roles seeded");

  for (const rank of ranks) {
    await prisma.rank.upsert({
      where: { name: rank.name },
      update: { minRating: rank.minRating, maxRating: rank.maxRating, color: rank.color, order: rank.order },
      create: rank,
    });
  }
  console.log("✓ Ranks seeded");

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: { description: achievement.description, xpReward: achievement.xpReward, category: achievement.category, condition: achievement.condition },
      create: achievement,
    });
  }
  console.log("✓ Achievements seeded");

  for (const title of titles) {
    await prisma.title.upsert({
      where: { name: title.name },
      update: { rarity: title.rarity },
      create: title,
    });
  }
  console.log("✓ Titles seeded");

  for (const category of questCategories) {
    await prisma.questCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, sortOrder: category.sortOrder },
      create: category,
    });
  }
  console.log("✓ Quest categories seeded");

  console.log("✓ All seeds complete");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
