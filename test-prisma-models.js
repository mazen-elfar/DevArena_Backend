import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testModels() {
  const models = [
    'user', 'profile', 'role', 'permission', 'rolePermission', 'userPermission', 
    'userRole', 'userProvider', 'skillCategory', 'skill', 'userSkill', 'post', 
    'comment', 'reaction', 'savedPost', 'follow', 'developerCircle', 'circleMember', 
    'friendship', 'conversation', 'conversationParticipant', 'message', 'questCategory', 
    'quest', 'testCase', 'submission', 'battle', 'battlePlayer', 'battleSubmission', 
    'matchmakingQueue', 'rank', 'rankHistory', 'tournament', 'tournamentRegistration', 
    'tournamentParticipant', 'tournamentResult', 'reputation', 'notification', 'xpLog', 
    'userRankHistory', 'userAchievement', 'coinTransaction', 'streak', 'organizationMember', 
    'teamMember', 'teamInvite', 'verificationRequest', 'userTitle', 'adminAction', 'report'
  ];

  console.log('--- Starting Model Isolation Test ---');

  for (const model of models) {
    try {
      console.log(`Testing model: ${model}...`);
      // Try to fetch one record or just count
      await prisma[model].count();
      console.log(`✓ ${model} OK`);
    } catch (error) {
      console.error(`✗ ${model} FAILED:`, error.message);
      // Don't exit, keep testing other models
    }
  }

  await prisma.$disconnect();
  console.log('--- Model Isolation Test Complete ---');
}

testModels();
